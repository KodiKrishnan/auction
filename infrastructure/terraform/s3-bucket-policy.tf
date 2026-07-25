################################################################################
# S3 Bucket Policy Document
################################################################################

data "aws_iam_policy_document" "frontend_bucket_policy" {

  statement {
    sid = "AllowCloudFrontServicePrincipalReadOnly"

    actions = [
      "s3:GetObject"
    ]

    resources = [
      "${module.s3.bucket_arn}/*"
    ]

    principals {
      type = "Service"

      identifiers = [
        "cloudfront.amazonaws.com"
      ]
    }

    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"

      values = [
        module.cloudfront.distribution_arn
      ]
    }
  }
}

################################################################################
# S3 Bucket Policy
################################################################################

resource "aws_s3_bucket_policy" "frontend" {
  bucket = module.s3.bucket_id
  policy = data.aws_iam_policy_document.frontend_bucket_policy.json
}