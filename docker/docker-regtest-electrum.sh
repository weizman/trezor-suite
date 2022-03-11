#!/usr/bin/env bash
set -e

export LOCAL_USER_ID=`id -u $USER`

BTC_REC_ADDR=$1
export $BTC_REC_ADDR

docker-compose -f ./docker/docker-compose.regtest-electrum.yml up --build --abort-on-container-exit --force-recreate

