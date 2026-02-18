# =============================================================================
# Outputs
# =============================================================================
# These values are displayed after `terraform apply` and can be referenced
# by other Terraform configurations via `terraform_remote_state`.
# =============================================================================

# -----------------------------------------------------------------------------
# Server Outputs
# -----------------------------------------------------------------------------

output "server_ip" {
  description = "Public IPv4 address of the server"
  value       = hcloud_server.main.ipv4_address
}

output "server_ipv6" {
  description = "Public IPv6 address of the server"
  value       = hcloud_server.main.ipv6_address
}

output "server_id" {
  description = "Hetzner Cloud server ID"
  value       = hcloud_server.main.id
}

output "server_status" {
  description = "Current status of the server (e.g. running, off)"
  value       = hcloud_server.main.status
}

# -----------------------------------------------------------------------------
# Network Outputs
# -----------------------------------------------------------------------------

output "network_id" {
  description = "ID of the private network"
  value       = hcloud_network.main.id
}

# -----------------------------------------------------------------------------
# Volume Outputs
# -----------------------------------------------------------------------------

output "volume_id" {
  description = "ID of the attached block storage volume"
  value       = hcloud_volume.data.id
}

# -----------------------------------------------------------------------------
# Connection Helpers
# -----------------------------------------------------------------------------

output "ssh_command" {
  description = "SSH command to connect to the server"
  value       = "ssh root@${hcloud_server.main.ipv4_address}"
}
