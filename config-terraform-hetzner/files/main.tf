# =============================================================================
# Hetzner Cloud Infrastructure
# =============================================================================
# This configuration creates a complete Hetzner Cloud environment:
#   - Server with cloud-init provisioning
#   - Private network with subnet
#   - Firewall with sensible ingress/egress rules
#   - Block storage volume attached to the server
#
# Usage:
#   export HCLOUD_TOKEN="your-token"
#   terraform init
#   terraform plan -var="server_name=my-app" -var="ssh_key_name=my-key"
#   terraform apply -var="server_name=my-app" -var="ssh_key_name=my-key"
# =============================================================================

# -----------------------------------------------------------------------------
# Local Values
# -----------------------------------------------------------------------------

locals {
  # Derive volume name from server name if not explicitly provided
  volume_name = var.volume_name != "" ? var.volume_name : "${var.server_name}-data"

  # Common labels applied to all resources for organization and billing
  common_labels = {
    environment = var.environment
    managed_by  = "terraform"
    server      = var.server_name
  }
}

# -----------------------------------------------------------------------------
# Data Sources
# -----------------------------------------------------------------------------

# Look up the SSH key by name (must already exist in the Hetzner project)
data "hcloud_ssh_key" "default" {
  name = var.ssh_key_name
}

# -----------------------------------------------------------------------------
# Private Network
# -----------------------------------------------------------------------------
# Creates an isolated network so servers can communicate privately without
# traversing the public internet. Useful for database <-> app connections.

resource "hcloud_network" "main" {
  name     = "${var.server_name}-network"
  ip_range = "10.0.0.0/16"

  labels = local.common_labels
}

resource "hcloud_network_subnet" "main" {
  network_id   = hcloud_network.main.id
  type         = "cloud"
  network_zone = var.network_zone
  ip_range     = "10.0.1.0/24"
}

# -----------------------------------------------------------------------------
# Firewall
# -----------------------------------------------------------------------------
# Allows only essential inbound traffic (SSH, HTTP, HTTPS) and permits all
# outbound traffic. Adjust rules to match your application requirements.

resource "hcloud_firewall" "main" {
  name = "${var.server_name}-firewall"

  labels = local.common_labels

  # --- Inbound Rules ---

  # SSH access (consider restricting source_ips to your IP for production)
  rule {
    description = "Allow SSH"
    direction   = "in"
    protocol    = "tcp"
    port        = "22"
    source_ips = [
      "0.0.0.0/0",
      "::/0"
    ]
  }

  # HTTP traffic
  rule {
    description = "Allow HTTP"
    direction   = "in"
    protocol    = "tcp"
    port        = "80"
    source_ips = [
      "0.0.0.0/0",
      "::/0"
    ]
  }

  # HTTPS traffic
  rule {
    description = "Allow HTTPS"
    direction   = "in"
    protocol    = "tcp"
    port        = "443"
    source_ips = [
      "0.0.0.0/0",
      "::/0"
    ]
  }

  # --- Outbound Rules ---

  # Allow all outbound TCP (package updates, API calls, etc.)
  rule {
    description    = "Allow all outbound TCP"
    direction      = "out"
    protocol       = "tcp"
    port           = "any"
    destination_ips = [
      "0.0.0.0/0",
      "::/0"
    ]
  }

  # Allow all outbound UDP (DNS resolution, NTP, etc.)
  rule {
    description    = "Allow all outbound UDP"
    direction      = "out"
    protocol       = "udp"
    port           = "any"
    destination_ips = [
      "0.0.0.0/0",
      "::/0"
    ]
  }

  # Allow outbound ICMP (ping, traceroute diagnostics)
  rule {
    description    = "Allow outbound ICMP"
    direction      = "out"
    protocol       = "icmp"
    destination_ips = [
      "0.0.0.0/0",
      "::/0"
    ]
  }
}

# -----------------------------------------------------------------------------
# Cloud-Init User Data
# -----------------------------------------------------------------------------
# Basic server provisioning script that runs on first boot:
#   - Updates packages
#   - Installs essential tools
#   - Configures unattended security upgrades
#   - Formats and mounts the attached volume
#   - Hardens SSH configuration

locals {
  cloud_init = <<-CLOUDINIT
    #cloud-config
    package_update: true
    package_upgrade: true

    packages:
      - curl
      - wget
      - git
      - ufw
      - fail2ban
      - unattended-upgrades

    write_files:
      - path: /etc/ssh/sshd_config.d/hardened.conf
        content: |
          PermitRootLogin prohibit-password
          PasswordAuthentication no
          X11Forwarding no
          MaxAuthTries 3
          ClientAliveInterval 300
          ClientAliveCountMax 2

    runcmd:
      # Enable automatic security updates
      - systemctl enable --now unattended-upgrades

      # Wait for the volume device to become available, then format and mount
      - |
        DEVICE="/dev/disk/by-id/scsi-0HC_Volume_${local.volume_name}"
        MOUNT="/mnt/data"
        if [ -b "$DEVICE" ]; then
          if ! blkid "$DEVICE"; then
            mkfs.ext4 -L data "$DEVICE"
          fi
          mkdir -p "$MOUNT"
          mount "$DEVICE" "$MOUNT"
          echo "$DEVICE $MOUNT ext4 defaults,discard,nofail 0 2" >> /etc/fstab
        fi

      # Enable and configure UFW (redundant with Hetzner firewall, defense-in-depth)
      - ufw default deny incoming
      - ufw default allow outgoing
      - ufw allow 22/tcp
      - ufw allow 80/tcp
      - ufw allow 443/tcp
      - ufw --force enable

      # Start fail2ban for SSH brute-force protection
      - systemctl enable --now fail2ban
  CLOUDINIT
}

# -----------------------------------------------------------------------------
# Server
# -----------------------------------------------------------------------------

resource "hcloud_server" "main" {
  name        = var.server_name
  server_type = var.server_type
  image       = var.image
  location    = var.location

  ssh_keys = [data.hcloud_ssh_key.default.id]

  user_data = local.cloud_init

  labels = local.common_labels

  # Attach the firewall to this server
  firewall_ids = [hcloud_firewall.main.id]

  # Place the server in the private network
  network {
    network_id = hcloud_network.main.id
    ip         = "10.0.1.2"
  }

  # The server must wait for the subnet to exist before joining the network
  depends_on = [
    hcloud_network_subnet.main
  ]

  lifecycle {
    # Prevent accidental destruction of running servers
    # Remove this block if you need to destroy/recreate
    # prevent_destroy = true

    # Ignore changes to user_data to avoid unnecessary rebuilds
    ignore_changes = [user_data]
  }
}

# -----------------------------------------------------------------------------
# Block Storage Volume
# -----------------------------------------------------------------------------
# Persistent storage that survives server deletion. Mounted at /mnt/data
# via the cloud-init script above.

resource "hcloud_volume" "data" {
  name     = local.volume_name
  size     = var.volume_size
  location = var.location
  format   = "ext4"

  labels = local.common_labels
}

resource "hcloud_volume_attachment" "data" {
  volume_id = hcloud_volume.data.id
  server_id = hcloud_server.main.id

  # Automount tells Hetzner to make the volume available as a block device
  automount = true
}
