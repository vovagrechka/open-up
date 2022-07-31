#!/bin/bash
set -ex

branch=main

git pull
git add .
git commit -m wat 
git push azure $branch 
git push gitlab $branch 
git push github $branch 

set +x
echo && echo [OK] && echo

