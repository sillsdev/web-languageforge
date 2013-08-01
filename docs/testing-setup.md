# How to set up testing on the server

## Step 1: node.js and Karma

Karma depends on node.js, but node.js isn't in the Wheezy (Debian 7) repositories. According to https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager the best method is to compile node yourself:

    sudo apt-get install checkinstall
    mkdir ~/src && cd ~/src
    wget -N http://nodejs.org/dist/node-latest.tar.gz
    tar xzvf node-latest.tar.gz && cd node-v*
    ./configure
    sudo checkinstall #(remove the "v" in front of the version number in the dialog, otherwise choose all defaults)
    # sudo dpkg -i node_* #only needed if you omitted "sudo" from checkinstall step

Now you can do:

    sudo npm install -g karma

And it should work. Verify by running ``karma --version`` and if you get output, you're good to go.

## Step 2: PhantomJS

You can compile phantom.js from source (http://phantomjs.org/build.html), but that takes quite a while (65 minutes on my virtual machine). I prefer to just download the pre-compiled binary package (http://phantomjs.org/download.html). This does mean you're trusting a binary from the Internet, but you can verify checksums to reduce uncertainty. The Linux 64-bit .tar.bz2 package I downloaded had the following checksums:

    MD5: a6a7d2cb38dd4305240cdc48e0d5a30f
    SHA1: 8ab4753abd352eaed489709c6c7dd13dae67cd91
    SHA256: d6da0f35b1f3c6219d49deaccda2b43e3e23e45000b3f49ffe7ff07f35a4f0d0

Once you've got a phantomjs binary, whether you built it from source or downloaded the binary package, put it somewhere on your PATH. (/usr/local/bin/ is probably best.)

If you download the binary, then you also need to install the libfontconfig package

    sudo apt-get install fontconfig

You can verify that phantomjs is in your path and working by typing:

    phantomjs -v

## Step 3: TeamCity

If installing on your local machine, you can (of course) skip this step; it's only needed when setting up a TeamCity build agent.

Once you've installed phantomjs, node.js, and karma in /usr/local/bin, you'll need to make one more change. The default TeamCity configuration for build agents doesn't get the PATH environment variable from /etc/profile, so anything run by TeamCity doesn't have /usr/local/bin on its PATH. To fix this, edit /var/lib/TeamCity/agent/conf/buildAgent.properties as follows:

    # Environment Variables
    env.PATH=/usr/local/bin:/usr/bin:/bin

Restart the build agent, and TeamCity should now be able to run Karma (and Karma should be able to find node.js and PhantomJS) correctly.
