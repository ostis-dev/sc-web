if ( apt-cache search python-pip | grep "python-pip\s" )
then
	sudo apt-get install -y python-pip
else
	sudo add-apt-repository universe
	sudo apt update
	sudo apt install python2 curl
	curl https://bootstrap.pypa.io/pip/2.7/get-pip.py -o get-pip.py
	sudo python2 get-pip.py
	sudo rm -f get-pip.py
fi
sudo pip install --default-timeout=100 future
sudo pip2 install tornado==4.2 sqlalchemy redis==2.9 numpy configparser
