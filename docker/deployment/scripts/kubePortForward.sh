#!/bin/bash

CONTAINER=app-7c76db448d-sq5st
PORT=55555

kubectl port-forward $CONTAINER $PORT:22
