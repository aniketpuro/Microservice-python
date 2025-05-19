resource "aws_instance" "controlplane" {
  ami             = var.default_ami_id
  instance_type   = var.instance_type
  key_name        = var.key_pair_name
  security_groups = [var.security_group_id]
  subnet_id       = data.aws_subnets.default_subnets.ids[0]
  associate_public_ip_address = true

  root_block_device {
    delete_on_termination = true
    volume_size           = 8
  }

  tags = {
    Name = "controlplane"
  }
}