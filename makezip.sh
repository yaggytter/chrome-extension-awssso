#!/bin/bash

cd `dirname $0`

rm ../ffesso.zip
zip -r ../ffesso.zip _locales icons screenshots *.js *.json *.html
