#!/bin/bash

CONTAINER=deploy/app
PORT=55555

kubectl port-forward $CONTAINER $PORT:22
