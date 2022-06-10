#!/bin/bash

trap "exit" TERM
/wait
apache2-foreground
