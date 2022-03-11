#!/usr/bin/env bash
set -e
shopt -s expand_aliases

alias bitcoin-cli="/usr/bin/bitcoin-cli -regtest -datadir=/root/.bitcoin --rpccookiefile=/root/.cookie -rpcport=18021"
BTC_REC_ADDR=$1

if [ -z "$BTC_REC_ADDR" ]
then
      echo "Please fill in the recieving BTC address as the first arg."
else
  # Get unspent transactions
  UNSENT_TR=$( bitcoin-cli listunspent)
  # Get trxId of the last transaction
  TRX_ID=$(echo $UNSENT_TR | jq -r '.[-1].txid')

  # Create a btc transaction
  TRX=$(bitcoin-cli createrawtransaction \
  "[{
  \"txid\" : \""$TRX_ID"\",
  \"vout\" : 0
  }]" \
  "{\""$BTC_REC_ADDR"\": 49.99999}")

  # Sign the transaction
  TX_OUTPUT=$(bitcoin-cli signrawtransactionwithwallet $TRX)

  # Broadcast the tx to the network
  HEX_ID=$(echo $TX_OUTPUT | jq -r '.hex')
  bitcoin-cli sendrawtransaction $HEX_ID &>/dev/null

  # Mine a new block
  ADDR=$(bitcoin-cli -rpcwallet=tenv-test getnewaddress)
  bitcoin-cli -rpcwallet=tenv-test generatetoaddress 150 $ADDR &>/dev/null
fi
