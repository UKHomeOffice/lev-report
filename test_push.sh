#!/usr/bin/env bash

set -o pipefail
make test | tee 'test.log'
set-tags
