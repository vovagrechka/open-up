#!/bin/bash
set -ex

repo=open-up
branch=main

git remote | xargs -n1 git remote rm

git remote add azure vgrechka@vs-ssh.visualstudio.com:v3/vgrechka/$repo/$repo
git remote add gitlab git@gitlab.com:vgrechka/$repo.git
git remote add github git@github.com:vovagrechka/$repo.git

git remote update
git branch -u azure/$branch

git remote -v
git branch -vv

set +x
echo && echo [OK] && echo

