#!/bin/bash

cd `dirname $0`

rm ../cesso.zip
zip -r ../cesso.zip _locales icons screenshots *.js *.json *.html
