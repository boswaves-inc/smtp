#!/bin/bash
# release.sh

VERSION=$1

if [ -z "$VERSION" ]; then
  echo "Usage: ./release.sh 1.0.0"
  exit 1
fi

git tag "v$VERSION"
git push origin "v$VERSION"

echo "✅ Tag v$VERSION pushed - GitHub Actions will handle the rest"