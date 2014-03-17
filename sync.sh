ssh root@linode "mysqldump -udpclub -phappyhour dpclub |gzip -c -" | gunzip -c - | mysql -uroot dpclub
