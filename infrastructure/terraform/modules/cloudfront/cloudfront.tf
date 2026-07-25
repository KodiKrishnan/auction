################################################################################
# CloudFront Distribution
################################################################################

resource "aws_cloudfront_distribution" "this" {

  enabled             = true
  is_ipv6_enabled     = true
  comment             = "${var.project_name}-${var.environment}-cloudfront"
  default_root_object = "index.html"
  aliases = [
  var.domain_name
  ]
  http_version        = "http2"
  price_class         = "PriceClass_200"

  ##############################################################################
  # S3 Origin
  ##############################################################################

  origin {
    domain_name              = var.s3_regional_domain_name
    origin_id                = local.s3_origin_id
    origin_access_control_id = aws_cloudfront_origin_access_control.s3.id
  }

  ##############################################################################
  # ALB Origin
  ##############################################################################

  origin {
    domain_name = var.alb_dns_name
    origin_id   = local.alb_origin_id

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only"

      origin_ssl_protocols = [
        "TLSv1.2"
      ]
    }
  }

  ##############################################################################
  # Default Cache Behavior (Frontend)
  ##############################################################################

  default_cache_behavior {

    target_origin_id       = local.s3_origin_id
    viewer_protocol_policy = "redirect-to-https"

    allowed_methods = [
      "GET",
      "HEAD"
    ]

    cached_methods = [
      "GET",
      "HEAD"
    ]

    compress = true

    cache_policy_id = data.aws_cloudfront_cache_policy.caching_optimized.id
  }

  ##############################################################################
  # Ordered Cache Behavior - API
  ##############################################################################

  ordered_cache_behavior {

    path_pattern     = "/api/*"
    target_origin_id = local.alb_origin_id

    viewer_protocol_policy = "redirect-to-https"

    allowed_methods = [
      "GET",
      "HEAD",
      "OPTIONS",
      "PUT",
      "POST",
      "PATCH",
      "DELETE"
    ]

    cached_methods = [
      "GET",
      "HEAD"
    ]

    compress = true

    cache_policy_id          = data.aws_cloudfront_cache_policy.caching_disabled.id
    origin_request_policy_id = data.aws_cloudfront_origin_request_policy.all_viewer.id
  }

  ##############################################################################
  # Custom Error Responses (React SPA)
  ##############################################################################

  custom_error_response {
    error_code            = 403
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 0
  }

  custom_error_response {
    error_code            = 404
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 0
  }

  ##############################################################################
  # Restrictions
  ##############################################################################

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  ##############################################################################
  # Viewer Certificate
  ##############################################################################

  viewer_certificate {

  acm_certificate_arn      = var.acm_certificate_arn
  ssl_support_method       = "sni-only"
  minimum_protocol_version = "TLSv1.2_2021"
  }

  ##############################################################################
  # Tags
  ##############################################################################

  tags = {
    Name        = "${var.project_name}-${var.environment}-cloudfront"
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}