terraform {
  backend "s3" {
    bucket       = "nivasabid-terraform-state"
    key          = "uat/terraform.tfstate"
    region       = "ap-south-1"
    use_lockfile = true
    encrypt      = true
  }
}