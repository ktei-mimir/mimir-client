provider "aws" {
  region  = "ap-southeast-2"
  profile = "ktei2008"
}

locals {
  root_domain = "askmimir.net"
  sub_domain  = "www.askmimir.net"
}


resource "aws_s3_bucket_website_configuration" "sub" {
  bucket = aws_s3_bucket.sub.bucket

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "error.html"
  }
}

resource "aws_s3_bucket_policy" "sub" {
  bucket = aws_s3_bucket.sub.bucket
  policy = jsonencode({
    Version   = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = ["s3:GetObject"]
        Resource  = [aws_s3_bucket.sub.arn, "${aws_s3_bucket.sub.arn}/*"]
      }
    ]
  })
}

resource "aws_s3_bucket_website_configuration" "this" {
  bucket = aws_s3_bucket.this.bucket

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "error.html"
  }

  routing_rule {
    redirect {
      host_name = local.sub_domain
    }
  }
}


resource "aws_s3_bucket" "sub" {
  bucket = local.sub_domain
}

resource "aws_s3_bucket" "this" {
  bucket = local.root_domain
}
