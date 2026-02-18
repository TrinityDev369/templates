# =============================================================================
# Terraform & Provider Configuration
# =============================================================================
# This file pins the Terraform version and configures the Hetzner Cloud
# provider. The HCLOUD_TOKEN environment variable must be set before running
# any Terraform commands.
#
# Authentication:
#   export HCLOUD_TOKEN="your-hetzner-api-token"
#
# Or use a .tfvars file / CI/CD secret -- never hardcode tokens in .tf files.
# =============================================================================

terraform {
  required_version = ">= 1.5"

  required_providers {
    hcloud = {
      source  = "hetznercloud/hcloud"
      version = ">= 1.45"
    }
  }

  # Uncomment and configure for remote state (recommended for teams):
  # backend "s3" {
  #   bucket   = "your-terraform-state-bucket"
  #   key      = "hetzner/terraform.tfstate"
  #   region   = "fsn1"
  #   endpoint = "https://fsn1.your-objectstorage.com"
  #
  #   skip_credentials_validation = true
  #   skip_metadata_api_check     = true
  #   skip_region_validation      = true
  #   force_path_style            = true
  # }
}

# The hcloud provider reads HCLOUD_TOKEN from the environment automatically.
# No token is specified here to avoid credential leakage.
provider "hcloud" {}
