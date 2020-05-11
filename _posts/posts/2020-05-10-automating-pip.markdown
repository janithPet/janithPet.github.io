---
layout: post
title:  "Automating requirements.txt"
date:   2020-03-12 21:19:24 +0000
type: 'Automation'
categories: posts
---

My friend told me the other day, that he would like his `requirements.txt` file to automatically update whenever he runs `pip install` or `pip uninstall`. I agreed with him, that this would be quite useful; so I sat down, had a cup of coffee and wrote a shell script that you can run after creating a virtual environment. This script will rewrite `pip` inside your virtual environment so that it will do the above, whenever a new package is installed, or uninstalled. I will describe this script below; you can find the Github repo that contains the script and its associated files [here](https://github.com/janithPet/bash/tree/master/upgradevenv).

## Virtual Environments

For those who aren't aware, a virtual environment is a sandbox for the modules and packages that you use in a python project. That is, it creates a separate python environment within which you can install the required set of packages for your project without interfering with other packages you have in your default environment. This allows you to fix the package dependencies of your project; updating or changing packages in your default environment will not affect your virtual environment, and therefore your project.

A virtual environment essentially creates a separate directory where you choose, which contains the core files that python needs to run. This includes the python interpreter, and pip. I usually use [`virtualenv`](https://virtualenv.pypa.io/en/latest/) to create virtual environments. As as example, if you navigate to your project's root folder, say `~/project/`, you can run `virtualenv venv` to create a virtual environment named `venv`. This creates a folder `~/project/venv`. You can activate `venv` (at least on MacOS and Linux) by running `source ~/project/venv/bin/activate`.

You can verify that something has changed by running `which python` before and after activating `venv`. Prior to activating it, `which python` will return the path to your default python interpreter; in my case, it was `/Users/janith_p/anaconda2/envs/py36/bin/python`. After activating `venv`, the command will return `~project/venv/bin/python`. Further, you can try running `pip freeze`in a similar fashion; this will show the currently accessible python packages from the activated python environment. Thus, in a freshly created and activate virtual environment, `pip freeze` should return empty.

Now interestingly, `pip` contains a flag which allows you to install packages from a text file. If you write a list of packages that are separated by line in a text file, say `~/project/requirements.txt`, then running `pip install -r ~/project/requirements.txt` will install all the packages that are listed in `~/project/requirements.txt`. You can also add version numbers to each of the packages. Thus, if you then list all the package dependencies of your project in a single location, and install them all in a single command. This is particularly useful if you want to share your project. Another individual who forks your project can then create virtual environment and easily install all the packages required to run your project.

Typically, during the development of a project, you would expect to install packages as needed, using `pip install <package>`. You would then have to manually update your `requirements.txt` file. This can get tedious, and would often involve continuously running `pip freeze` and copy-pasting its output in your file. Let's see how we can automate it.

## Playing with `pip`
`pip` is a package manager for python. It allows you to install and uninstall 3rd party packages with ease. Now once you have activated your virtual environment, we will see that the main pip file is located at `~/project/venv/bin/pip`, assuming the conventions above; you can find yours by running `which pip`. It turns out that this is a python file, with the following code.

{% highlight python %}
#!~/project/venv/bin/python

# -*- coding: utf-8 -*-
import re
import sys

from pip._internal import main

if __name__ == '__main__':
    sys.argv[0] = re.sub(r'(-script\.pyw?|\.exe)?$', '', sys.argv[0])
    sys.exit(main())

{% endhighlight %}

As we can see, this is simply importing and running a `pip._internal.main` method on the arguments that are passed when calling `pip` from the folder. The source code for `pip._internal.main` can be found in `~/project/venv/lib/python3.6/site-packages/pip/_internal/main.py`; we will look at that later. Now, in the script above, once `main()` is run, the program exits with whatever exit code that `main()` returns. This means that the code for installing the packages must be contained within `main()`. Thus, if the installation or uninstallation of a package runs without error, `main()` should return with exit code 0. We can test this by modifying the code as follows, and running with a correct and incorrect call to `pip install`; for example, `pip install tiny` and `pip install tinyy` respectively.

{% highlight python %}
#!~/project/venv/bin/python

# -*- coding: utf-8 -*-
import re
import sys

from pip._internal import main

if __name__ == '__main__':
    sys.argv[0] = re.sub(r'(-script\.pyw?|\.exe)?$', '', sys.argv[0])

    #Collect and print exit code
    main_exit_code = main()
    print(f'Exit code: {main_exit_code}')

    #Exit with exit_code
    sys.exit(main_exit_code)
{% endhighlight %}

Since the core installation code is in `main()`, we can edit this file to update our `requirements.txt` file *after* `main()` has run with success; if the `pip` call fails, we wouldn't want to change anything. Therefore, we can add an `if` statement after running `main()` that is only run if `exit_code == 0`. Thus, if we have code that can identify which packages were installed, we can add this under this conditional. This is shown below:

{% highlight python %}
#!~/project/venv/bin/python

# -*- coding: utf-8 -*-
import re
import sys
import os
import subprocess
from pip._internal.cli.main import main
from pip._internal.exceptions import PipError
from pip._internal.cli.main_parser import parse_command

if __name__ == '__main__':
requirements_address = <absolute path to requirements.txt>

sys.argv[0] = re.sub(r'(-script\.pyw?|\.exe)?$', '', sys.argv[0])


main_exit_code = main()

if main_exit_code == 0:
    try:
        cmd_name, cmd_args = parse_command(sys.argv[1:])
    except PipError as exc:
        sys.stderr.write('ERROR: %s' % exc)
        sys.stderr.write(os.linesep)
        sys.exit(1)

    # remove requirements.txt from arg list
    if '-r' in cmd_args:
        _idx = cmd_args.index('-r')
        del cmd_args[_idx]
        del cmd_args[_idx]

    arg_names = {a.split('==')[0]:a for a in cmd_args}

    if cmd_name == 'install':
        #create requirements file if necessary.
        subprocess.call(['touch', requirements_address])

        with open(requirements_address, 'r+') as f:
            _lines = f.readlines()
            lines = [line.rstrip() for line in _lines]
            line_names = [line.split('==')[0] for line in lines]
            f.seek(0)

            for line, line_name, _line in zip(lines, line_names, _lines):
                if line_name in arg_names.keys():
                    f.write(f'{arg_names[line_name]}\n')
                    del arg_names[line_name]
                else:
                    f.write(_line)

            for cmd_arg in arg_names.values():
                f.write(f'{cmd_arg}\n')
            f.truncate()


    elif cmd_name == 'uninstall':
        try:
            with open(requirements_address, 'r+') as f:
                lines = f.readlines()
                f.seek(0)
                for line in lines:
                    l = line.rstrip().split('==')[0]
                    if l not in arg_names.keys():
                        f.write(line)
                f.truncate()
        except:
            pass
sys.exit(main_exit_code)
{% endhighlight %}

Now, here, the majority of the code is written to parse an existing `requirements.txt` file, and replace, add or remove the package name, and version (if applicable) correctly. I won't be discussing that here. However, note the following portion of the code.

{% highlight python %}
        try:
            cmd_name, cmd_args = parse_command(sys.argv[1:])
        except PipError as exc:
            sys.stderr.write('ERROR: %s' % exc)
            sys.stderr.write(os.linesep)
            sys.exit(1)
{% endhighlight %}


This was taken directly from `~/project/venv/lib/python3.6/site-packages/pip/_internal/main.py`. Here, `parse_command()` takes the arguments that are passed when `pip` is called, and returns the command called and its arguments, as lists of strings. For example, if we called `pip install tiny small==0.1`, then `cmd_name=['install']` and `cmd_args=['tiny', 'small==0.1']`. We use this in the proceeding code.

Note that you should replace '<path to requirements.txt>' with the absolute path to your `requirements.txt` file. Now, if we replace the `pip` file in our virtual environment with the code above and run say `pip install tiny`, we will see that the `requirements.txt` file will have updated to include `tiny`.

Of course, manually have to copy this code everytime you install a virtual environment is quite painful. The following section details how we can write a shell script that we can run after running `virtualenv venv` to automatically update the `pip` file in `venv/bin/`.

## Upgrading pip with a shell script.

We will assume that this shell script is saved in `~/shell_scripts/<script name>.sh`. You
This shell script will take 2 optional arguments, the path to the `venv` of the virtual environment, and the path to the `requirements.txt` file. These will be passed in with flags `-p` and `-r` respectively. By default, we will assume that this script is called from the projects folder, from where `virtualenv venv` was called, and that our virtual environment is called `venv` and the requirements file is called `requirements.txt`. The following code will parse these arguments and set to default values.

{% highlight bash %}
#!/bin/bash
#Helper function to kill program with message
die () {
    echo >&2 "$@"
    exit 1
}

while getopts ":r:p:" opt; do
  case $opt in
    r) path_to_req="$OPTARG"
    ;;
    p) path_to_venv="$OPTARG"
    ;;
    \?) die "Invalid option -$OPTARG"
    ;;
  esac
done

# default values
: ${path_to_req="./requirements.txt"}
: ${path_to_venv="./venv/"}

#get absolute paths
path_to_venv="$(cd "$(dirname "$1")"; pwd)/$(basename "$path_to_venv")"
path_to_req="$(cd "$(dirname "$1")"; pwd)/$(basename "$path_to_req")"
{% endhighlight %}

Note that we can pass in relative paths if necessary. The final 2 lines of code here will extract the absolute paths from these.

Now, we will want to check if the `venv` folder exists. We do that by adding the following:

{% highlight bash %}
if [[ ! -d $path_to_venv ]]; then
  die "$path_to_venv does not exist."
fi
{% endhighlight %}

 We will then want to create a `pip` file that contains the code above, but with the correct paths assigned to the first line, where the python interpreter is called, and the `requirements_address` variable. To do this, we will create a base `pip` file in the same directory that we save this shell script; that is `~/shell_scripts/pip`. This file will contain the same code as `pip` file above, but, with the following replacements,

 1. replace `#!~/project/venv/bin/python` with `REPLACE_PYTHON`, and

 2. replace `requirements_address = <absolute path to requirements.txt>` with `REPLACE_ADDRESS`.

 These will form key words that we can use to replace with the correct paths. Thus, inside `~/shell_scripts/<script name>.sh`, we can do the following.

{% highlight bash %}
cp ~/shell_scripts/pip ~/shell_scripts/pip.sub

#replace appropriate paths
path_to_python="#!/$path_to_venv/bin/python"
sed -i '' "s|REPLACE_PYTHON|$path_to_python|g" /Volumes/dev/dev/bash/upgradevenv/pip.sub
sed -i '' 's|REPLACE|'"\'$path_to_req\'"'|g' /Volumes/dev/dev/bash/upgradevenv/pip.sub

#move to inside venv
mv /Volumes/dev/dev/bash/upgradevenv/pip.sub "$path_to_venv/bin/pip"
{% endhighlight %}

Here, we first copy the base `pip` file to another temp file `pip.sub`. Note that here, we use the absolute paths to the folder that contains our base pip folder; adjust this path as necessary. We then use `sed` to replace the key words we set previously with the appropriate paths. Knowing the path to `venv` tells us where the python interpreter is.

*Note that `sed` here was tested on MacOS; you might have to change these portions of the code depending on your operating system.*

Following this, we replace `~/project/venv/bin/pip` with this temporary file using the `mv` command.

## Conclusions

Now, after we run `virtualenv venv` in our projects folder, we can run `~/shell_scripts/<script name>.sh` [(after making it executable)](https://medium.com/@peey/how-to-make-a-file-executable-in-linux-99f2070306b5) to automatically update the `pip` file with our upgraded version.

As a conclusion, you can create an alias in `~/.bash_profile` (MacOS) or `~/.bash_rc` (Ubuntu) to call ~/shell_scripts/<script name>.sh` from anywhere. In my case, this is done by adding `alias upgradevenv="/<path_to_script_folder>/upgradevenv.sh"`.

The code in the [Github repo](https://github.com/janithPet/bash/tree/master/upgradevenv) is slightly different, as some changes were made for ease of exposition.
