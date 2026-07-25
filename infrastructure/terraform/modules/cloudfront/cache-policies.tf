################################################################################
# CloudFront Cache Policy - Static Content
################################################################################

data "aws_cloudfront_cache_policy" "caching_optimized" {
  name = "Managed-CachingOptimized"
}

################################################################################
# CloudFront Cache Policy - API
################################################################################

data "aws_cloudfront_cache_policy" "caching_disabled" {
  name = "Managed-CachingDisabled"
}

################################################################################
# CloudFront Origin Request Policy
################################################################################

data "aws_cloudfront_origin_request_policy" "all_viewer" {
  name = "Managed-AllViewer"
}