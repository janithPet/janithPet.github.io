---
layout: post
title:  "Python Project 2"
date:   2020-04-12 21:19:24 +0000
type: 'python'
categories: [projects, python]
---
You’ll find this post in your `_posts` directory. Go ahead and edit it and re-build the site to see your changes. You can rebuild the site in many different ways, but the most common way is to run `jekyll serve`, which launches a web server and auto-regenerates your site when a file is updated.

Jekyll requires blog post files to be named according to the following format:

`YEAR-MONTH-DAY-title.MARKUP`

Where `YEAR` is a four-digit number, `MONTH` and `DAY` are both two-digit numbers, and `MARKUP` is the file extension representing the format used in the file. After that, include the necessary front matter. Take a look at the source for this post to get an idea about how it works.

Jekyll also offers powerful support for code snippets:


<div class="row">
  <div>
  Function wrapper
  {% highlight python %}
  import time
  from typing import Callable, List, Dict

  def timer(f: Callable, args: List = [], kwargs: Dict = {}):
    start_time = time.time()
    rv  = f(*args, **kwargs) #run original function
    total_time = time.time() - start_time #calculate time taken
    print(f'{f.__name__} took {total_time}s to complete')

    return rv

  if __name__ == '__main__':
      def double(x=10):
        return 2*x

      timer(double, [2]) # -> double took 4.0531158447265625e-06s to complete
  {% endhighlight %}
  </div>
  <div>
  <!-- ** -->
  Decorator
  {% highlight python %}
  import time
  from typing import Callable

  def timer(f: Callable):
    def wrapper(*args, **kwargs):
      start_time = time.time()
      rv  = f(*args, **kwargs) #run original function
      total_time = time.time() - start_time #calculate time taken
      print(f'{f.__name__} took {total_time}s to complete')

      return rv
    return wrapper

  if __name__ == '__main__':
    @timer
    def double(x=10):
      return 2*x

    double(2) # -> double took 4.0531158447265625e-06s to complete
  {% endhighlight %}
  <!-- ** -->
  </div>
</div>



Check out the [Jekyll docs][jekyll-docs] for more info on how to get the most out of Jekyll. File all bugs/feature requests at [Jekyll’s GitHub repo][jekyll-gh]. If you have questions, you can ask them on [Jekyll Talk][jekyll-talk].

[jekyll-docs]: https://jekyllrb.com/docs/home
[jekyll-gh]:   https://github.com/jekyll/jekyll
[jekyll-talk]: https://talk.jekyllrb.com/
