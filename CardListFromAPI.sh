#!/bin/bash
curl "https://dtdb.co/api/cards/" | jq '.[] | select(.pack != "Promos")' > ./data/cardList.txt
