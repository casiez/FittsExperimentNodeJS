# FittsExperimentNodeJS
Fitts' experiment task written in Node.js

## Setup
1. Run ```npm install```
1. Create in MySQL a database called ```FittsExperiment```
1. Create sql user ```fitts``` with password ```Paul2018``` and provide him access to ```FittsExperiment``` 
1. Create a table ```results``` using the following command: 

```
CREATE TABLE `results` (
 `id` int(11) NOT NULL AUTO_INCREMENT,
 `creationdate` datetime NOT NULL DEFAULT current_timestamp(),
 `hash` varchar(50) DEFAULT NULL,
 `res` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
 PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=52 DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT
``` 


## Run the server
Run the server using the command 