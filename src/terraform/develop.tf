provider "aws" {
  profile = "default"
  region = "eu-central-1"
}

terraform {
  backend "s3" {
    bucket = "mlreef-infrastructure-state"
    key    = "terraform.tfstate"
    region = "eu-central-1"
  }
}

variable "instance_type" {
  type = string
}
variable "environment_name" {
  type = string
}

locals {
  availability_zone = "eu-central-1b"
}

resource "aws_instance" "develop" {
  ami               = "ami-050a22b7e0cf85dd0"
  instance_type     = var.instance_type
  availability_zone = local.availability_zone    // see ebs volume's availability zone
  key_name          = "development"              // private public key pair "develppment.pem"
  monitoring        = true
  tags = {
    Name = var.environment_name
  }
  vpc_security_group_ids = [                     // add to security group "application-servers"
      "sg-01c6f11ecf39a976e"
  ]
  root_block_device {
    delete_on_termination = true
    volume_size = 16                            // size of the / hdd in Gigabytes
  }
  user_data = file("startup.sh")
}


resource "aws_ebs_volume" "data" {
  availability_zone = local.availability_zone    // see ec instance's availability zone
  type              = "gp2"                      // "standard", "gp2", "io1", "sc1" or "st1"
  size              = 100                        // 100 Gigabyte
}
resource "aws_volume_attachment" "data-volume" {
  device_name = "/dev/sda2"
  instance_id = aws_instance.develop.id
  volume_id   = aws_ebs_volume.data.id
}


resource "aws_eip_association" "develop" {
  instance_id   = aws_instance.develop.id
  allocation_id = "eipalloc-0efb3e016625a71a2"
  provisioner "local-exec" {
    command = "echo ${aws_eip_association.develop.public_ip} > instance.info"
  }
}
