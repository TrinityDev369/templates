# =============================================================================
# Input Variables
# =============================================================================
# All configurable values for the Hetzner Cloud infrastructure.
# Override defaults via terraform.tfvars, -var flags, or environment variables
# (TF_VAR_<name>).
# =============================================================================

# -----------------------------------------------------------------------------
# Server Configuration
# -----------------------------------------------------------------------------

variable "server_name" {
  description = "Name of the Hetzner Cloud server"
  type        = string

  validation {
    condition     = can(regex("^[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$", var.server_name))
    error_message = "Server name must be lowercase alphanumeric with hyphens, 2-63 characters."
  }
}

variable "server_type" {
  description = "Hetzner server type (e.g. cx22, cx32, cx42, cax21 for ARM). See: https://www.hetzner.com/cloud#pricing"
  type        = string
  default     = "cx22"
}

variable "image" {
  description = "OS image for the server (e.g. ubuntu-24.04, debian-12, fedora-40)"
  type        = string
  default     = "ubuntu-24.04"
}

variable "location" {
  description = "Hetzner datacenter location (fsn1 = Falkenstein, nbg1 = Nuremberg, hel1 = Helsinki, ash = Ashburn, hil = Hillsboro)"
  type        = string
  default     = "fsn1"

  validation {
    condition     = contains(["fsn1", "nbg1", "hel1", "ash", "hil"], var.location)
    error_message = "Location must be one of: fsn1, nbg1, hel1, ash, hil."
  }
}

variable "ssh_key_name" {
  description = "Name of an existing SSH key in your Hetzner Cloud project"
  type        = string
}

# -----------------------------------------------------------------------------
# Network Configuration
# -----------------------------------------------------------------------------

variable "network_zone" {
  description = "Network zone for the private network (eu-central, us-east, us-west)"
  type        = string
  default     = "eu-central"
}

# -----------------------------------------------------------------------------
# Volume Configuration
# -----------------------------------------------------------------------------

variable "volume_size" {
  description = "Size of the attached volume in GB"
  type        = number
  default     = 50

  validation {
    condition     = var.volume_size >= 10 && var.volume_size <= 10000
    error_message = "Volume size must be between 10 and 10000 GB."
  }
}

variable "volume_name" {
  description = "Name for the attached block storage volume"
  type        = string
  default     = ""
}

# -----------------------------------------------------------------------------
# Metadata & Tags
# -----------------------------------------------------------------------------

variable "environment" {
  description = "Environment tag applied to all resources (e.g. production, staging, development)"
  type        = string
  default     = "production"

  validation {
    condition     = contains(["production", "staging", "development"], var.environment)
    error_message = "Environment must be one of: production, staging, development."
  }
}
