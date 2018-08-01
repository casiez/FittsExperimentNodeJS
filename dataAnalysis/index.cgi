#!/usr/bin/env python3
# -*- coding: utf-8 -*-
#
# Gery Casiez
#
# index.cgi -
#
# See the file LICENSE for information on usage and redistribution of
# this file, and for a DISCLAIMER OF ALL WARRANTIES.


import cgitb ; cgitb.enable()
import MySQLdb
import json

print("Content-Type: text/html; charset=utf-8")
print("Cache-Control: no-cache")
print()

db = MySQLdb.connect(host="127.0.0.1",    # your host, usually localhost
                     port=3306,
                     user="fitts",         # your username
                     passwd="Paul2018",  # your password
                     db="FittsExperiment")        # name of the data base

cur = db.cursor()

cur.execute("SELECT id, creationdate, hash, res FROM results")

s = "participant,is_mobile,d,w,orientation,time,err<br/>"

for row in cur.fetchall():
    part_id = row[0]
    r = json.loads(row[3])
    for r0 in r['res']:
        d = r0['d']
        w = r0['w']
        o = r0['o']
        t = r0['t']
        err = r0['err']
        # Skip starting trial of each block
        if (o != 0):
            s = s + str(part_id) + "," + str(r['is_mobile']) + "," + str(d) + "," + str(w) + "," + \
            str(o) + "," + str(t) + "," + str(err) + "<br/>"
print(s)


