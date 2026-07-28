window.COURSE_DATA = {
  "title": "小光陪你写爬虫 · 进阶深水区",
  "chapters": [
    {
      "title": "异步爬虫基础",
      "icon": "🌀",
      "color": "#5b8fc4",
      "lessons": [
        {
          "id": "a1l1",
          "title": "同步为何慢：I/O 等待与 GIL 的误会",
          "icon": "🐌",
          "markdown": "## 同步爬虫：一个一个来，慢在哪\n\n同步代码像排队打饭：**发一个请求 → 干等服务器回数据 → 收到才发下一个**。等的时候你的程序被「阻塞」住，啥也干不了。\n\n### 慢的根因：I/O 等待\n爬虫 90% 时间在等网络（I/O），不是算数据。同步模式下，等的时候线程被卡死，100 个网址就要等 100 次往返。\n\n### GIL 背不背锅？\n很多人以为慢是 Python 的 GIL（全局锁）。**其实不是**——GIL 限制的是 CPU 计算并行，而爬虫瓶颈是 I/O 等待。这锅 GIL 不背。\n\n### 对比一眼懂\n| 模式 | 等第 1 个时 | 100 个网址耗时 |\n|---|---|---|\n| 同步 | 卡住干等 | ≈ 100 × 单程 |\n| 异步 | 去发第 2、3…个 | ≈ 接近 1 次单程 |\n\n> 💡 异步不是「算得更快」，而是「等的时候不闲着」。",
          "takeaway": "同步慢在「等网络时线程被卡住干等」，不是 GIL 的锅（GIL 只限 CPU 并行）。异步精髓：等的时候不闲着，去发下一个请求，100 个网址并发≈一次单程。",
          "figures": [
            {
              "key": "adv_sync_vs_async",
              "caption": "🐌 同步排队干等 vs 异步边等边发：瓶颈在 I/O 等待，不在算力"
            }
          ],
          "words": [
            {
              "en": "ASYNC",
              "zh": "异步：不等结果、先去干别的事的执行方式",
              "pron": "əˈsɪŋk"
            },
            {
              "en": "BLOCK",
              "zh": "阻塞：程序卡在某一步动不了，直到这步完成",
              "pron": "blɑːk"
            },
            {
              "en": "IO",
              "zh": "I/O：输入/输出，这里指网络收发等等待型操作",
              "pron": "aɪ ˈoʊ"
            }
          ],
          "exercises": [
            {
              "type": "choice",
              "question": "同步爬虫慢，最主要的原因是？",
              "options": [
                "等网络 I/O 时线程被阻塞、干等着",
                "Python 算数据太慢",
                "GIL 把 CPU 锁死了"
              ],
              "answer": 0,
              "explain": "爬虫瓶颈是网络等待，线程在等响应时被卡住，而不是算力不够。"
            },
            {
              "type": "fill",
              "question": "异步的核心思想不是「算得更快」，而是「___ 的时候去干别的事」。（填两个字：等/算）",
              "answer": "等",
              "explain": "异步的价值在 I/O 等待期间不空转，去发起别的请求。"
            },
            {
              "type": "tap",
              "question": "下列哪些属于 I/O 等待？（多选）",
              "options": [
                "等服务器回 HTTP 响应",
                "等磁盘读文件",
                "做一道数学题",
                "等数据库返回结果"
              ],
              "answer": [
                0,
                1,
                3
              ],
              "explain": "做数学题是 CPU 计算，不是 I/O 等待；其余都是等外部设备/网络。",
              "multi": true
            },
            {
              "type": "choice",
              "question": "关于 GIL，下列说法正确的是？",
              "options": [
                "GIL 是爬虫慢的元凶",
                "GIL 限制 CPU 并行，但不背 I/O 等待的锅",
                "GIL 让 Python 根本写不了爬虫"
              ],
              "answer": 1,
              "explain": "GIL 影响的是多核 CPU 并行计算，爬虫慢在等网络，两者不是一回事。"
            },
            {
              "type": "open",
              "question": "用你自己的话说说：为什么异步能让抓 100 个网址比同步快那么多？",
              "answer": "因为异步在等某个网址响应时不空转，趁机去发其他请求，100 个请求几乎同时飞出去，总耗时接近一次单程而不是 100 次累加。"
            },
            {
              "type": "coding",
              "question": "顺序下载 5 个网页，每个耗时 2 秒；并发下载 5 个一起跑只要约 2 秒。算一算两种方式的「总耗时」并打印。",
              "starter": "per = 2\nn = 5\nseq = 0   # TODO: 顺序总耗时 = ?\ncon = 0   # TODO: 并发总耗时约 = ?\nprint('顺序', seq, '秒；并发', con, '秒')",
              "_gen": "coding-ex",
              "expect": "顺序 10 秒"
            }
          ],
          "tasks": [
            "用 time 测一下：同步抓 5 个网址用多久？记下数字，学完异步再测一次对比。",
            "在纸上画两幅小人图：同步=排队干等；异步=边等边发下一个。",
            "想一个生活里「等的时候可以并行做」的例子（如烧水时顺便刷牙）。"
          ],
          "color": "#5b8fc4"
        },
        {
          "id": "a1l2",
          "title": "asyncio 三件套：事件循环·协程·任务",
          "icon": "🔁",
          "markdown": "## asyncio 三件套，记住这三个词\n\n### 1. 事件循环（Event Loop）= 调度员\n它是个死循环，手里攥着一堆「待办」，哪个能跑了就调度哪个。你不用管它怎么转，只要把活交给它。\n\n### 2. 协程（Coroutine）= 能暂停的函数\n用 `async def` 定义的函数，遇到 `await` 就**主动让出**控制权，等结果好了再回来接着跑。它像「会打瞌睡的员工」，睡的时候把工位让给别人。\n\n### 3. 任务（Task）= 被排进循环的具体工单\n`asyncio.create_task(协程())` 把协程包成任务丢进循环，循环才真正开始并发跑它。\n\n### 最小骨架\n```python\nimport asyncio\n\nasync def job(n):\n    print(f\"任务{n}开工\")\n    await asyncio.sleep(1)   # 模拟等网络，这里让出控制权\n    print(f\"任务{n}完工\")\n\nasync def main():\n    await asyncio.gather(job(1), job(2), job(3))  # 三个一起跑\n\nasyncio.run(main())\n```\n`gather` 把多个协程打包并发；`await` 是「这儿要等，先去忙别的」的标记。\n\n> ⚠️ 易错：`await` 只能写在 `async def` 里；普通函数里写 `await` 直接报语法错。",
          "takeaway": "事件循环=调度员，协程=用 async def 写、遇 await 会让出控制权的函数，任务=丢进循环的具体工单。asyncio.run 启动循环，gather 并发多个协程。记住：await 只能在 async 函数里用。",
          "figures": [
            {
              "key": "adv_event_loop",
              "caption": "🔁 事件循环当调度员：协程遇到 await 让出工位，循环去跑别的协程，回来再续上"
            }
          ],
          "words": [
            {
              "en": "COROUTINE",
              "zh": "协程：用 async def 定义、能中途让出的函数",
              "pron": "ˈkɔːruːtiːn"
            },
            {
              "en": "AWAIT",
              "zh": "await：标记「这里要等，先去忙别的」",
              "pron": "əˈweɪt"
            },
            {
              "en": "GATHER",
              "zh": "gather：把多个协程打包一起并发跑",
              "pron": "ˈɡæðər"
            }
          ],
          "exercises": [
            {
              "type": "choice",
              "question": "事件循环（Event Loop）扮演什么角色？",
              "options": [
                "调度员，决定哪个协程能跑",
                "一个具体要抓的网址",
                "一种数据库"
              ],
              "answer": 0,
              "explain": "事件循环负责调度所有协程，是 asyncio 的发动机。"
            },
            {
              "type": "fill",
              "question": "用 `async def` 定义的函数叫______（填两个字：协/线/进）。",
              "answer": "协程",
              "explain": "async def 定义的是协程（coroutine）。"
            },
            {
              "type": "order",
              "question": "把 asyncio 跑起来的正常顺序排一排：",
              "steps": [
                "定义 async def 协程函数",
                "在 main 里用 gather/create_task 组织协程",
                "调用 asyncio.run(main()) 启动事件循环",
                "协程内用 await 标记等待点"
              ],
              "explain": "顺序：先写协程函数→在组织处排活→run 启动循环；await 写在协程内部。"
            },
            {
              "type": "choice",
              "question": "下面哪句会直接语法报错？",
              "options": [
                "在 async def 里写 await",
                "在普通 def 里写 await",
                "用 asyncio.run 启动"
              ],
              "answer": 1,
              "explain": "await 只能出现在 async 函数内部，普通函数里写会语法错误。"
            },
            {
              "type": "open",
              "question": "用一句话比喻「协程遇到 await 让出控制权」这件事，让别人一听就懂。",
              "answer": "像打瞌睡的员工：活干到要等别人的时候，把工位让给同事先干，等自己那份好了再回来接着干。"
            },
            {
              "type": "coding",
              "question": "协程=能暂停的函数，靠事件循环调度。下面这段代码要在你本机跑（浏览器跑不了 asyncio），看懂思路后点「标记完成」。",
              "starter": "import asyncio\n\nasync def greet(name):\n    print('你好,', name)\n    await asyncio.sleep(0)   # 让出控制权\n\nasync def main():\n    await asyncio.gather(greet('小明'), greet('小红'), greet('小刚'))\n\nasyncio.run(main())",
              "_gen": "coding-ex"
            }
          ],
          "tasks": [
            "打开 Python，把上面的三件套骨架敲一遍，看三个任务是不是「几乎同时」完工。",
            "故意在普通 def 里写一句 await，看报错长什么样，记住这个坑。",
            "把「事件循环=调度员」画成一张小图贴在显示器边。"
          ],
          "color": "#5b8fc4"
        },
        {
          "id": "a1l3",
          "title": "aiohttp 并发抓取：把 asyncio 用在网络上",
          "icon": "🌐",
          "markdown": "## aiohttp：异步版的 requests\n\n`requests` 是同步的，会阻塞；`aiohttp` 是异步的，配合 `async with` + `await` 才能并发抓。\n\n### 单发 vs 并发\n```python\nimport aiohttp, asyncio\n\nasync def fetch(session, url):\n    async with session.get(url) as resp:\n        return await resp.text()   # await：等响应时不空转\n\nasync def main():\n    urls = [\"https://example.com\"] * 5\n    async with aiohttp.ClientSession() as session:\n        tasks = [fetch(session, u) for u in urls]\n        htmls = await asyncio.gather(*tasks)   # 5 个并发飞出\n    print(len(htmls))\n\nasyncio.run(main())\n```\n关键点：**一个 `ClientSession` 复用**；`fetch` 里两处 `await`（等连接、等正文）都是让出点。\n\n### 为什么快\n5 个网址同时飞出去，总耗时≈最慢那一个的单程，而不是 5 个相加。这正是异步的爽点。\n\n> ⚠️ 易错：别在 `async with session.get()` 里漏了 `await`；`resp.text()` 也要 `await`，否则拿到的是协程对象不是字符串。",
          "takeaway": "aiohttp 是异步版 requests：用 async with session.get(url) 发请求，await resp.text() 拿正文。一个 ClientSession 复用，gather 把多个 fetch 并发。两处都要 await，漏了就拿到协程而非字符串。",
          "figures": [
            {
              "key": "adv_sync_vs_async",
              "caption": "🌐 用 aiohttp + gather：多个请求同时飞出，总耗时≈最慢一个而非相加"
            }
          ],
          "words": [
            {
              "en": "AIOHTTP",
              "zh": "aiohttp：支持异步的 HTTP 客户端库",
              "pron": "eɪ aɪ oʊ ˈeɪtʃˈtiˈtiˈpi"
            },
            {
              "en": "SESSION",
              "zh": "ClientSession：可复用的会话，管连接池",
              "pron": "ˈsɛʃən"
            },
            {
              "en": "CLIENT",
              "zh": "Client：客户端，这里指发请求的一方",
              "pron": "ˈklaɪənt"
            }
          ],
          "exercises": [
            {
              "type": "choice",
              "question": "下面哪段才能正确异步拿到网页正文？",
              "options": [
                "html = session.get(url).text",
                "async with session.get(url) as r: html = await r.text()",
                "html = await session.get(url)"
              ],
              "answer": 1,
              "explain": "必须 await 响应对象，再 await r.text() 取正文；漏 await 拿不到字符串。"
            },
            {
              "type": "fill",
              "question": "多个协程要一起并发，常用 `asyncio.______(*tasks)` 打包。（填一个词）",
              "answer": "gather",
              "explain": "asyncio.gather 把多个协程并发执行并收集结果。"
            },
            {
              "type": "tap",
              "question": "用 aiohttp 抓一个网址，哪些地方必须 await？（多选）",
              "options": [
                "session.get(url) 拿到响应",
                "resp.text() 取正文",
                "创建任务列表",
                "import aiohttp"
              ],
              "answer": [
                0,
                1
              ],
              "explain": "get 拿到响应、text 取正文都是等待点需 await；建列表和 import 不需。",
              "multi": true
            },
            {
              "type": "choice",
              "question": "复用哪个对象能省下反复建连接的开销？",
              "options": [
                "每次新建 requests",
                "一个 ClientSession 复用",
                "每请求 new 一个 socket"
              ],
              "answer": 1,
              "explain": "ClientSession 带连接池，复用它比每次新建高效得多。"
            },
            {
              "type": "open",
              "question": "为什么说 aiohttp 并发抓 5 个网址的总耗时≈最慢那一个，而不是 5 个相加？",
              "answer": "因为 5 个请求在事件循环里几乎是同时发出的，各自在等自己响应时让出控制权，彼此不排队，所以总时间由最慢的那个决定。"
            },
            {
              "type": "coding",
              "question": "aiohttp 把 asyncio 用在网络上，并发抓很多页。下面代码需本机运行（浏览器跑不了网络），看懂点「标记完成」。",
              "starter": "import asyncio, aiohttp\n\nasync def fetch(session, url):\n    async with session.get(url) as r:\n        return await r.text()\n\nasync def main():\n    urls = ['https://a.com', 'https://b.com']\n    async with aiohttp.ClientSession() as s:\n        pages = await asyncio.gather(*(fetch(s, u) for u in urls))\n    print('抓了', len(pages), '页')\n\nasyncio.run(main())",
              "_gen": "coding-ex"
            }
          ],
          "tasks": [
            "装 aiohttp：`pip install aiohttp`，把上面的并发骨架跑通，对比同步版计时。",
            "把 urls 换成 3 个不同网站，看并发是否真的「同时」返回。",
            "故意漏掉一个 await 运行，观察报错信息并记住。"
          ],
          "color": "#5b8fc4"
        },
        {
          "id": "a1l4",
          "title": "信号量限速：并发不是无穷大",
          "icon": "🚦",
          "markdown": "## 信号量（Semaphore）：给并发拧个水龙头\n\n并发越多越快？**错**。一次性甩 10000 个请求会把对方服务器冲垮，也可能把自己 IP 搞封，还可能把本机内存撑爆。\n\n### 信号量 = 同时最多跑 N 个\n`asyncio.Semaphore(5)` 表示同一时刻最多 5 个协程在跑，其余排队。\n\n```python\nsem = asyncio.Semaphore(5)\n\nasync def fetch(session, url):\n    async with sem:                      # 占一个名额，用完归还\n        async with session.get(url) as r:\n            return await r.text()\n```\n`async with sem` 像进洗手间占坑位：坑满了就在门外等，出来一个进一个。\n\n### 限速三件套\n1. **Semaphore** 限制同时并发数\n2. **delay** 每次请求间随机睡一小会儿\n3. **限总 QPS**（每秒请求数）更稳\n\n> 💡 重点：**信号量限制的是「同时跑几个」，不是「跑得多快」**。它防的是把对方冲垮，不是提速。很多人误会它能加速，其实恰恰相反——它是主动踩刹车。",
          "takeaway": "信号量 Semaphore(N) 限制同一时刻最多 N 个协程并发，像占坑位，满了就排队。它是主动限速、防冲垮服务器/防封 IP，不是提速。配合随机延迟和限 QPS 更稳。",
          "figures": [
            {
              "key": "adv_semaphore",
              "caption": "🚦 Semaphore(5)：5 个坑位，满了排队；限制的是同时并发数，是踩刹车不是加油门"
            }
          ],
          "words": [
            {
              "en": "SEMAPHORE",
              "zh": "信号量：限制同时运行的协程数量",
              "pron": "ˈsɛməfɔːr"
            },
            {
              "en": "CONCURRENT",
              "zh": "并发：同一时段多个任务都在推进",
              "pron": "kənˈkʌrənt"
            },
            {
              "en": "THROTTLE",
              "zh": "限速：主动控制速度，别冲垮对方",
              "pron": "ˈθrɑːtl"
            }
          ],
          "exercises": [
            {
              "type": "choice",
              "question": "Semaphore(5) 是什么意思？",
              "options": [
                "最多同时跑 5 个协程",
                "总共只能发 5 个请求",
                "每个请求限速 5 秒"
              ],
              "answer": 0,
              "explain": "信号量限制并发度，不是总次数也不是单请求耗时。"
            },
            {
              "type": "choice",
              "question": "信号量主要作用是？",
              "options": [
                "让爬虫跑得更快",
                "主动限速、防止冲垮服务器或封 IP",
                "把结果排好序"
              ],
              "answer": 1,
              "explain": "它是踩刹车，限制同时并发，保护对方也保护自己。"
            },
            {
              "type": "fill",
              "question": "`async with ______` 能在进入时占一个名额、退出时归还，用来做并发限速。（填英文名）",
              "answer": "sem",
              "explain": "async with sem 用信号量占位/归还，实现并发上限。"
            },
            {
              "type": "tap",
              "question": "下列哪些是稳妥的限速手段？（多选）",
              "options": [
                "用 Semaphore 限制并发数",
                "每次请求间随机 sleep 一小会儿",
                "一次性甩 10000 个请求",
                "限制每秒请求数 QPS"
              ],
              "answer": [
                0,
                1,
                3
              ],
              "explain": "一次性狂发会冲垮服务器/被封；其余都是稳妥限速。",
              "multi": true
            },
            {
              "type": "open",
              "question": "为什么说「并发不是越大越好」？举一个后果。",
              "answer": "并发过大可能瞬间冲垮目标服务器触发封 IP，也可能耗尽本机内存或打满本地端口，反而全崩。信号量是主动刹车。"
            },
            {
              "type": "coding",
              "question": "信号量(并发数)限制同时只跑 3 个。要抓 10 个页面，算一算需要几「批」才能跑完（向上取整）。",
              "starter": "import math\nn = 10\nsem = 3\nwaves = 0   # TODO: 几批 = ceil(n/sem)\nprint('需要', waves, '批')",
              "_gen": "coding-ex",
              "expect": "需要 4 批"
            }
          ],
          "tasks": [
            "把上节的并发例子加上 Semaphore(3)，抓 10 个网址，观察是否最多 3 个同时在跑。",
            "在 fetch 里加一行 `await asyncio.sleep(random.uniform(0.1,0.3))`，体会随机延迟。",
            "记住一句话写下来：信号量限制同时几个，不是提速。"
          ],
          "color": "#5b8fc4"
        },
        {
          "id": "a1l5",
          "title": "异步异常处理与超时：别让一个挂了全崩",
          "icon": "⏱️",
          "markdown": "## 单个请求挂了，凭什么连累全场？\n\n并发抓 100 个网址，第 50 个超时，**如果不用 try 包住**，整个 `gather` 可能直接抛异常，剩下 50 个白抓。所以每个 `fetch` 都要自己兜底。\n\n### try/except 包住单个任务\n```python\nasync def fetch(session, url):\n    try:\n        async with session.get(url, timeout=10) as r:\n            return await r.text()\n    except Exception as e:\n        print(f\"{url} 翻车：{e}\")\n        return None\n```\n`timeout=10` 表示等 10 秒没响应就放弃，不无限干等。\n\n### gather 的两种脾气\n- `asyncio.gather(*tasks)`：**一个抛异常，全部报错**（默认）。\n- `asyncio.gather(*tasks, return_exceptions=True)`：**单个失败只返回异常对象，其余照常**。✅ 推荐。\n\n### 超时三板斧\n1. `client.get(timeout=10)` 单请求超时\n2. `asyncio.wait_for(coro, 10)` 给任意协程加时限\n3. 外层再包 try，确保返回值可处理\n\n> ⚠️ 易错：`timeout` 参数在 aiohttp 里是 `aiohttp.ClientTimeout` 或简写秒数，写错位置会不生效。",
          "takeaway": "每个 fetch 用 try/except 兜底，单请求设 timeout=10 防无限等。gather 加 return_exceptions=True，让一个失败不影响其余。超时可用 client 的 timeout 或 asyncio.wait_for。核心：别让一个挂了拖垮全场。",
          "figures": [
            {
              "key": "adv_retry_429",
              "caption": "⏱️ 单请求 try 兜底 + 超时：一个翻车返回 None，其余继续，全场不崩"
            }
          ],
          "words": [
            {
              "en": "TIMEOUT",
              "zh": "超时：等这么久还没响应就放弃",
              "pron": "ˈtaɪmaʊt"
            },
            {
              "en": "EXCEPT",
              "zh": "except：捕获异常、防止程序崩溃",
              "pron": "ɪkˈsɛpt"
            },
            {
              "en": "RETURN_EX",
              "zh": "return_exceptions：让单个失败不影响其余",
              "pron": "rɪˈtɜːrn ɪkˈsɛpʃənz"
            }
          ],
          "exercises": [
            {
              "type": "choice",
              "question": "gather 默认（不加 return_exceptions）时，一个任务抛异常会？",
              "options": [
                "只那个任务失败，其余照常",
                "整个 gather 报错，其余也拿不到",
                "自动重试那个任务"
              ],
              "answer": 1,
              "explain": "默认情况下一个异常会冒泡，导致整个 gather 失败。"
            },
            {
              "type": "fill",
              "question": "给单个请求加 `timeout=__`，等待超过这个数就放弃，避免无限干等。（填数字示例）",
              "answer": "10",
              "explain": "timeout=10 表示等 10 秒无响应就放弃。"
            },
            {
              "type": "choice",
              "question": "想让「一个失败不影响其余」，该怎么写？",
              "options": [
                "gather(*t)",
                "gather(*t, return_exceptions=True)",
                "try 包住 gather"
              ],
              "answer": 1,
              "explain": "return_exceptions=True 让失败任务只返回异常对象，其余正常。"
            },
            {
              "type": "tap",
              "question": "下列哪些能防止「一个请求卡死拖垮全场」？（多选）",
              "options": [
                "每个 fetch 用 try/except 兜底",
                "给请求设 timeout",
                "gather 用 return_exceptions=True",
                "把所有请求写在一个函数里"
              ],
              "answer": [
                0,
                1,
                2
              ],
              "explain": "单独兜底+超时+return_exceptions 三件套防雪崩；堆一个函数没用。",
              "multi": true
            },
            {
              "type": "open",
              "question": "为什么并发爬虫里「每个任务自己 try 兜底」比「外层一个 try 包全部」更稳？",
              "answer": "因为外层一个 try 一旦捕获异常就会中断整批，已发的其余请求结果也丢了；每个任务内部兜底能让失败的单挑出局、其余照常拿到结果。"
            },
            {
              "type": "coding",
              "question": "异步里一个任务抛异常不能让全部崩，要用 try/except 包住。下面代码需本机跑（浏览器跑不了 asyncio），看懂点「标记完成」。",
              "starter": "import asyncio\n\nasync def may_fail(i):\n    if i == 2:\n        raise ValueError('挂了')\n    return 'ok' + str(i)\n\nasync def main():\n    for i in range(4):\n        try:\n            print(await may_fail(i))\n        except Exception as e:\n            print('跳过', i, '原因', e)\n\nasyncio.run(main())",
              "_gen": "coding-ex"
            }
          ],
          "tasks": [
            "把 fetch 故意指向一个不存在的网址，分别试「不加兜底」和「加 try+return_exceptions」，对比结果。",
            "给请求设 timeout=2，抓一个超慢的网址，看是否按时放弃。",
            "写一条规则：凡 gather 必带 return_exceptions=True。"
          ],
          "color": "#5b8fc4"
        }
      ]
    },
    {
      "title": "httpx 与现代客户端",
      "icon": "🚀",
      "color": "#3a9d5d",
      "lessons": [
        {
          "id": "a2l1",
          "title": "httpx：一个库，同步异步一体",
          "icon": "🔀",
          "markdown": "## httpx：一个库，两种活法\n\n`requests` 只能同步；`aiohttp` 只能异步。httpx 两者通吃——**同一个 API，加个 `async` 就能异步**，迁移成本极低。\n\n### 同步写法（和 requests 几乎一样）\n```python\nimport httpx\nr = httpx.get(\"https://example.com\")\nprint(r.status_code, len(r.text))\n```\n### 异步写法（加 async/await）\n```python\nimport httpx, asyncio\nasync def main():\n    async with httpx.AsyncClient() as c:\n        r = await c.get(\"https://example.com\")\n        print(r.status_code)\nasyncio.run(main())\n```\n> 注意：同步用 `httpx.get`；异步用 `httpx.AsyncClient()` + `await c.get`。**别混**：异步函数里调同步 `httpx.get` 会阻塞事件循环，前功尽弃。\n\n### 速记\n| 场景 | 用 |\n|---|---|\n| 简单脚本、懒得改 | 同步 httpx.get |\n| 高并发抓取 | AsyncClient + await |",
          "takeaway": "httpx 一个库通吃同步/异步：同步 httpx.get；异步 httpx.AsyncClient()+await c.get。千万别在 async 里用同步 get，会阻塞事件循环拖垮并发。",
          "figures": [
            {
              "key": "request_response",
              "caption": "🔀 httpx 同步 httpx.get vs 异步 AsyncClient+await：同一套 API，加 async 即可并发"
            }
          ],
          "words": [
            {
              "en": "HTTPX",
              "zh": "httpx：同时支持同步与异步的 HTTP 客户端库",
              "pron": "eɪtʃˈtiˈtiˈpi ɛks"
            },
            {
              "en": "ASYNCCLIENT",
              "zh": "AsyncClient：httpx 的异步客户端",
              "pron": "əˈsɪŋk ˈklaɪənt"
            },
            {
              "en": "MIGRATE",
              "zh": "迁移：从 requests 换过来几乎不改写法",
              "pron": "ˈmaɪɡreɪt"
            }
          ],
          "exercises": [
            {
              "type": "choice",
              "question": "下列哪个库既能同步又能异步？",
              "options": [
                "requests",
                "aiohttp",
                "httpx"
              ],
              "answer": 2,
              "explain": "httpx 一套 API 同时支持同步和异步。"
            },
            {
              "type": "fill",
              "question": "异步要用 `httpx.______()` 而不是 `httpx.get`。（填类名）",
              "answer": "AsyncClient",
              "explain": "异步用 httpx.AsyncClient() 上下文管理器。"
            },
            {
              "type": "tap",
              "question": "异步 httpx 的正确姿势有哪些？（多选）",
              "options": [
                "用 AsyncClient",
                "用 await c.get",
                "写在 async def 里",
                "在 async 里用同步 httpx.get 也行"
              ],
              "answer": [
                0,
                1,
                2
              ],
              "explain": "异步必须 AsyncClient+await 且写在 async 函数内；混用同步 get 会阻塞循环。",
              "multi": true
            },
            {
              "type": "choice",
              "question": "在 async 函数里误用同步 httpx.get 会怎样？",
              "options": [
                "完全没问题",
                "阻塞事件循环、拖垮并发",
                "自动变成异步"
              ],
              "answer": 1,
              "explain": "同步调用会卡住单线程事件循环，并发优势全没。"
            },
            {
              "type": "open",
              "question": "为什么说从 requests 迁移到 httpx 比换 aiohttp 成本低？",
              "answer": "因为 httpx 同步写法和 requests 几乎一样，只想异步时加 AsyncClient 和 await 即可，不用重写整套请求逻辑。"
            },
            {
              "type": "coding",
              "question": "httpx 一个库同步异步都能用。下面代码需本机跑（浏览器跑不了网络），看懂点「标记完成」。",
              "starter": "import httpx\n\nwith httpx.Client() as c:\n    r = c.get('https://example.com')\n    print('状态码', r.status_code, '长度', len(r.text))",
              "_gen": "coding-ex"
            }
          ],
          "tasks": [
            "装 httpx，分别跑同步版和异步版抓同一网址，对比代码差异。",
            "故意在 async 函数里用同步 httpx.get，观察是否一下子变慢。",
            "记一句口诀：异步必用 AsyncClient 配 await。"
          ],
          "color": "#3a9d5d"
        },
        {
          "id": "a2l2",
          "title": "连接池复用：别每次都握手",
          "icon": "🔗",
          "markdown": "## 连接池：省掉重复握手\n\n每次发请求都要 TCP 三次握手 + TLS 加密握手，挺费时。**连接池**把建好的连接缓存复用，下次直接发数据。\n\n### httpx 默认就带池\n```python\nasync with httpx.AsyncClient() as c:   # 内部维护连接池\n    for u in urls:\n        r = await c.get(u)             # 复用连接，不每次重握\n```\n一个 `AsyncClient` 生命周期内，连同一主机自动复用连接。\n\n### 手动拧池大小\n```python\nlimits = httpx.Limits(max_connections=100, max_keepalive_connections=20)\nasync with httpx.AsyncClient(limits=limits) as c:\n    ...\n```\n- `max_connections`：最多同时开多少连接\n- `max_keepalive_connections`：池里留多少个保活\n\n> 💡 池太小→并发上不去；池太大→打爆对方或本机端口耗尽。配合信号量一起调。",
          "takeaway": "连接池缓存已建连接、省掉重复握手；httpx 的 AsyncClient 默认带池。Limits 调 max_connections 与 max_keepalive；太大可能打爆对方或耗光端口，要配合信号量。",
          "figures": [
            {
              "key": "adv_httpx_pool",
              "caption": "🔗 连接池复用：建好的 TCP/TLS 连接缓存起来，下次直接发数据，省掉握手"
            }
          ],
          "words": [
            {
              "en": "LIMITS",
              "zh": "Limits：httpx 里控制连接池大小的配置",
              "pron": "ˈlɪmɪts"
            },
            {
              "en": "KEEPALIVE",
              "zh": "保活连接：池里留着、随时能用的连接",
              "pron": "ˈkiːp əˈlaɪv"
            },
            {
              "en": "POOL",
              "zh": "连接池：复用连接的缓冲",
              "pron": "puːl"
            }
          ],
          "exercises": [
            {
              "type": "choice",
              "question": "连接池主要省掉什么开销？",
              "options": [
                "握手建连的开销",
                "解析 HTML",
                "写磁盘"
              ],
              "answer": 0,
              "explain": "池复用已建立的连接，避免每次重复 TCP/TLS 握手。"
            },
            {
              "type": "fill",
              "question": "AsyncClient 内部自带______池（填两字：连接/线程/进程）。",
              "answer": "连接",
              "explain": "httpx 客户端默认维护连接池。"
            },
            {
              "type": "choice",
              "question": "关于池大小，正确的是？",
              "options": [
                "越大越好",
                "太小并发上不去、太大可能打爆对方",
                "和并发完全无关"
              ],
              "answer": 1,
              "explain": "池要适中：太小限并发，太大有打爆对端或耗尽本机端口的风险。"
            },
            {
              "type": "tap",
              "question": "下列哪些是 httpx.Limits 的参数？（多选）",
              "options": [
                "max_connections",
                "max_keepalive_connections",
                "timeout",
                "retries"
              ],
              "answer": [
                0,
                1
              ],
              "explain": "Limits 管连接数；timeout/retries 不是 Limits 字段。",
              "multi": true
            },
            {
              "type": "open",
              "question": "为什么「连接池太大」反而有风险？举个具体后果。",
              "answer": "池太大意味着同时开大量连接，可能瞬间压垮目标服务器触发封禁，也可能耗尽本机端口或文件描述符导致程序报错。"
            },
            {
              "type": "coding",
              "question": "连接池复用 TCP，别每次都握手。下面代码需本机跑，看懂点「标记完成」。",
              "starter": "import httpx\n\nwith httpx.Client(headers={'Connection': 'keep-alive'}) as c:\n    for _ in range(3):\n        r = c.get('https://example.com')\n        print('复用连接，第', _, '次', r.status_code)",
              "_gen": "coding-ex"
            }
          ],
          "tasks": [
            "把上节并发例子改成复用同一个 AsyncClient，看是否更快更稳定。",
            "设一个很小的 max_connections=2，抓 10 个网址感受并发受限。",
            "记住：池大小要配合信号量一起调。"
          ],
          "color": "#3a9d5d"
        },
        {
          "id": "a2l3",
          "title": "异步解析并行抠数据",
          "icon": "⚡",
          "markdown": "## 抓和解析，都能并行\n\n很多人以为「异步只管发请求」。其实**解析（抠数据）也能并发**——抓回来一堆 HTML，用 asyncio 把解析也并行掉，CPU 不闲着。\n\n### 抓+解析流水线\n```python\nfrom lxml import html as lxml_html\nasync def parse_one(raw):\n    doc = lxml_html.fromstring(raw)\n    return doc.xpath(\"//h1/text()\")   # 解析也能是协程里的活\n\nasync def main():\n    htmls = await asyncio.gather(*[fetch(u) for u in urls])\n    results = await asyncio.gather(*[parse_one(h) for h in htmls])\n```\n`gather` 第二次把「解析」也并发了，N 个页面同时抠。\n\n### 真正的坑：CPU 密集会卡循环\n解析、正则、算哈希都是 **CPU 活**。asyncio 是单线程，一个协程狂算会卡住事件循环，别人等不了。解法：丢给线程池 `await asyncio.to_thread(重活)`。\n\n> ⚠️ 易错：把超重的 CPU 解析直接写在协程里，会拖累全部并发。重活用 `asyncio.to_thread(...)` 挪到别的线程。",
          "takeaway": "抓和解析都能用 gather 并发；但 CPU 重的解析会卡单线程事件循环，要用 asyncio.to_thread 挪到别的线程，否则拖累全场并发。",
          "figures": [
            {
              "key": "adv_event_loop",
              "caption": "⚡ 事件循环调度「抓」和「解析」：两者都能并发进循环，重 CPU 活用 to_thread 挪走"
            }
          ],
          "words": [
            {
              "en": "PARSE",
              "zh": "解析：从 HTML 里抠出结构化数据",
              "pron": "pɑːrs"
            },
            {
              "en": "TOTHREAD",
              "zh": "to_thread：把重活丢到别的线程跑",
              "pron": "tə ˈθrɛd"
            },
            {
              "en": "PIPELINE",
              "zh": "流水线：抓→解析→存，一环接一环",
              "pron": "ˈpaɪplaɪn"
            }
          ],
          "exercises": [
            {
              "type": "choice",
              "question": "解析（抠数据）能放进 asyncio 并发吗？",
              "options": [
                "不能，只能同步",
                "能，用 gather 把解析也并发",
                "必须用多进程"
              ],
              "answer": 1,
              "explain": "解析本身可以是协程里的步骤，用 gather 并发多个页面解析。"
            },
            {
              "type": "fill",
              "question": "超重的 CPU 解析活要挪到别的线程，用 `await asyncio.______(重活)`。",
              "answer": "to_thread",
              "explain": "asyncio.to_thread 把阻塞/CPU 重活移到线程池，不卡事件循环。"
            },
            {
              "type": "choice",
              "question": "单线程 asyncio 里一个协程狂算哈希会怎样？",
              "options": [
                "不影响别人",
                "卡住事件循环、拖累全部并发",
                "自动开新核并行"
              ],
              "answer": 1,
              "explain": "单线程下重 CPU 活会占住循环，其他协程等不了。"
            },
            {
              "type": "tap",
              "question": "下列哪些环节可以并发（多选）",
              "options": [
                "并发发请求",
                "并发解析 HTML",
                "并发写数据库",
                "串行干等网络"
              ],
              "answer": [
                0,
                1,
                2
              ],
              "explain": "抓、解析、写库都能并发；串行等网络恰恰是要避免的。",
              "multi": true
            },
            {
              "type": "open",
              "question": "为什么「抓和解析都并发」比「先全抓完再一个个解析」快？",
              "answer": "后者解析阶段是串行的，N 个页面要一个个抠；前者用 gather 把解析也并发，多个页面同时抠，整体耗时大幅下降。"
            },
            {
              "type": "coding",
              "question": "下面是一批网页源码(放在 htmls 列表)。用正则把每个里面所有 <li>文字</li> 的标题抓出来，拼成一个大列表并打印。",
              "starter": "import re\nhtmls = ['<ul><li>苹果</li><li>香蕉</li></ul>', '<ul><li>橙子</li><li>西瓜</li></ul>']\nall_items = []   # TODO: 遍历 htmls，用 re.findall 提取 <li>(.*?)</li> 并extend\nprint(all_items)",
              "_gen": "coding-ex",
              "expect": "['苹果', '香蕉', '橙子', '西瓜']"
            }
          ],
          "tasks": [
            "把 fetch 和 parse 串成两段 gather，跑 5 个页面看总耗时。",
            "故意把一段重正则写在协程里狂跑，观察是否拖累别的请求。",
            "记住口诀：CPU 重活 to_thread。"
          ],
          "color": "#3a9d5d"
        },
        {
          "id": "a2l4",
          "title": "指数退避应对 429",
          "icon": "🔁",
          "markdown": "## 429 = 你太快了，歇会儿\n\n服务器回 `429 Too Many Requests`，意思是「你请求太频繁」。硬重试会越撞越封。**指数退避**：第一次等 1s，再失败等 2s、4s、8s……翻倍增长，给服务器喘口气。\n\n### 退避模板\n```python\nimport asyncio, httpx\nasync def get_with_retry(c, url, max_tries=5):\n    wait = 1\n    for i in range(max_tries):\n        r = await c.get(url)\n        if r.status_code == 200:\n            return r.text\n        if r.status_code == 429:\n            await asyncio.sleep(wait)   # 退避\n            wait *= 2                    # 翻倍\n            continue\n        return None\n    return None\n```\n### 加抖动更稳\n纯翻倍可能和别的客户端「同频」撞车，加一点随机 `wait *= (0.5 + random.random())` 错峰。\n\n> ⚠️ 易错：退避只对「可重试」错误（429/5xx 超时）有意义；404 这种永久错误重试没用，直接放弃。",
          "takeaway": "429=请求太频繁。指数退避：等 1s→2s→4s 翻倍，并加随机抖动错峰；只对 429/5xx 等可重试错误有意义，404 直接放弃。",
          "figures": [
            {
              "key": "adv_retry_429",
              "caption": "🔁 指数退避：1s→2s→4s 翻倍等，429 时给服务器喘口气，避免越撞越封"
            }
          ],
          "words": [
            {
              "en": "BACKOFF",
              "zh": "退避：失败后等一会再试，且越等越久",
              "pron": "ˈbækɔːf"
            },
            {
              "en": "RETRY",
              "zh": "重试：失败了再发一次",
              "pron": "ˈriːtraɪ"
            },
            {
              "en": "JITTER",
              "zh": "抖动：加随机量错峰，避免同频撞车",
              "pron": "ˈdʒɪtər"
            }
          ],
          "exercises": [
            {
              "type": "choice",
              "question": "429 状态码表示？",
              "options": [
                "页面不存在",
                "请求太频繁、请慢点",
                "服务器崩了"
              ],
              "answer": 1,
              "explain": "429 Too Many Requests = 频率过高。"
            },
            {
              "type": "fill",
              "question": "指数退避是等待时间逐次______（填两字：翻倍/减半/随机）。",
              "answer": "翻倍",
              "explain": "指数退避每次等待乘以 2。"
            },
            {
              "type": "choice",
              "question": "下面哪种错误重试通常没意义？",
              "options": [
                "429",
                "500 超时",
                "404 页面不存在"
              ],
              "answer": 2,
              "explain": "404 是永久不存在，重试也不会变出页面。"
            },
            {
              "type": "tap",
              "question": "让退避更稳的做法有哪些？（多选）",
              "options": [
                "等待时间翻倍",
                "加随机抖动错峰",
                "对 404 也死命重试",
                "设最大重试次数"
              ],
              "answer": [
                0,
                1,
                3
              ],
              "explain": "404 不该重试；翻倍+抖动+上限才是稳妥退避。",
              "multi": true
            },
            {
              "type": "open",
              "question": "为什么「加随机抖动」能避免和别的爬虫同频撞车？",
              "answer": "如果所有客户端都用同样的 1-2-4-8 节奏，会在同一时刻集体重试 again 撞击服务器；加随机让大家的 retry 时间错开，峰值被削平。"
            },
            {
              "type": "coding",
              "question": "请求被限流(429)要退避重试。写代码算出前 4 次重试的等待秒数：第 i 次等 2**i 秒（i 从 1 开始）。",
              "starter": "delays = []\nfor i in range(1, 5):\n    delays.append(0)   # TODO: 填入 2**i\nprint(delays)",
              "_gen": "coding-ex",
              "expect": "[2, 4, 8, 16]"
            }
          ],
          "tasks": [
            "写个 get_with_retry，故意请求一个会限频的接口，看退避是否生效。",
            "给退避加随机抖动，对比纯翻倍的节奏。",
            "记一句：404 不重试，429/5xx 才退避。"
          ],
          "color": "#3a9d5d"
        }
      ]
    },
    {
      "title": "高效解析 XPath",
      "icon": "🧭",
      "color": "#6a8fd4",
      "lessons": [
        {
          "id": "a3l1",
          "title": "lxml 与 XPath：用路径点名元素",
          "icon": "🎯",
          "markdown": "## XPath：用路径精确点名网页元素\n\nBeautifulSoup 用 .find 慢慢找；XPath 像「文件系统路径」，`/html/body/div[1]/h1` 一步直达。lxml 是跑得最快的 XPath 引擎。\n\n### 最小例子\n```python\nfrom lxml import html\ndoc = html.fromstring(html_text)\ntitles = doc.xpath(\"//h1/text()\")          # 所有 h1 的文字\nlinks = doc.xpath(\"//a/@href\")             # 所有 a 的链接\n```\n- `//` 表示「任意层级往下找」\n- `/text()` 取文字，`/@href` 取属性\n\n### 对比 BS4\n| | 写法 | 速度 |\n|---|---|---|\n| BS4 find | 一步步导航 | 较慢 |\n| XPath | 一条路径直达 | 快很多 |\n\n> 💡 XPath 用「路径 + 条件」定位，适合层层嵌套、规则固定的页面；正则适合非结构文本。",
          "takeaway": "XPath 用路径精确点名元素，// 任意层级、/text() 取文字、/@href 取属性。lxml 是速度最快的 XPath 引擎，适合嵌套深、规则固定的页面。",
          "figures": [
            {
              "key": "adv_xpath_tree",
              "caption": "🎯 XPath 像文件路径：//h1/text() 一步直达，lxml 引擎最快"
            }
          ],
          "words": [
            {
              "en": "XPATH",
              "zh": "XPath：用路径语法在 XML/HTML 里定位节点",
              "pron": "ɛks pɑːθ"
            },
            {
              "en": "LXML",
              "zh": "lxml：高效的 XML/HTML 解析库，支持 XPath",
              "pron": "ɛl ɛks ɛm ɛl"
            },
            {
              "en": "NODE",
              "zh": "节点：HTML 树里的一个元素/文字",
              "pron": "noʊd"
            }
          ],
          "exercises": [
            {
              "type": "choice",
              "question": "XPath 里 `//` 表示？",
              "options": [
                "只找直接子节点",
                "任意层级往下找",
                "找属性"
              ],
              "answer": 1,
              "explain": "// 表示跨任意层级 descendant。"
            },
            {
              "type": "fill",
              "question": "`doc.xpath(\"//a/@____\")` 才能拿到链接地址（填属性名）。",
              "answer": "href",
              "explain": "//a/@href 取 a 标签的 href 属性。"
            },
            {
              "type": "choice",
              "question": "关于 lxml 与 BeautifulSoup，正确的是？",
              "options": [
                "lxml 用 XPath 且更快",
                "BS4 永远更快",
                "两者不能共存"
              ],
              "answer": 0,
              "explain": "lxml+XPath 通常比 BS4 的纯 Python 导航更快。"
            },
            {
              "type": "tap",
              "question": "下列哪些是 XPath 常见用法（多选）",
              "options": [
                "//h1/text() 取文字",
                "//a/@href 取链接",
                "//div[1] 第一个 div",
                ".find 慢慢找"
              ],
              "answer": [
                0,
                1,
                2
              ],
              "explain": "前三个是 XPath；.find 是 BS4 风格。",
              "multi": true
            },
            {
              "type": "open",
              "question": "什么场景下 XPath 比 BS4 的 find 更顺手？",
              "answer": "当页面嵌套很深、要按「第几个」「某个属性」精确定位时，一条 XPath 直达比层层 find 更短更快。"
            },
            {
              "type": "coding",
              "question": "下面 sample 是一段商品 HTML。用正则提取所有 class=\"price\" 的 <span> 里的价格（含￥），打印列表。",
              "starter": "import re\nsample = '<span class=\"price\">￥12</span><span class=\"price\">￥35</span>'\nprices = []   # TODO: 用 re.findall 提取 class=\"price\">(￥\\d+)\nprint(prices)",
              "_gen": "coding-ex",
              "expect": "['￥12', '￥35']"
            }
          ],
          "tasks": [
            "装 lxml，用 XPath 抠一个真实页面的标题和所有链接。",
            "对比同样需求用 BS4 find 写出来的代码行数。",
            "记一句：// 任意层级，/@属性 取属性。"
          ],
          "color": "#6a8fd4"
        },
        {
          "id": "a3l2",
          "title": "轴与函数精准定位",
          "icon": "🧩",
          "markdown": "## 轴（axis）与函数：在 XPath 里「找邻居」\n\n光用标签路径不够。XPath 的「轴」能按**位置关系**找元素：父、子、兄弟、祖先。\n\n### 常用轴\n- `parent::` 父节点\n- `following-sibling::` 后面的兄弟\n- `ancestor::` 祖先\n\n```python\ndoc.xpath(\"//span[@class='price']/parent::div\")     # 价格的父 div\ndoc.xpath(\"//h2/following-sibling::p\")               # h2 后面的 p\n```\n### 函数精准筛选\n- `contains(@class,'item')` 类名包含 item\n- `text()='确定'` 文字精确等于\n- `last()` 最后一个；`position()=1` 第一个\n\n> ⚠️ 易错：`//div[@class='a b']` 要求 class **完全等于** \"a b\"（顺序敏感）。多半该用 `contains(@class,'a')` 才稳。",
          "takeaway": "XPath 轴按关系定位：parent（父）、following-sibling（后兄弟）、ancestor（祖先）。函数 contains(@class,'x') 比精确等于更稳，因为 class 多值顺序敏感。",
          "figures": [
            {
              "key": "adv_xpath_tree",
              "caption": "🧩 轴按关系找：parent 父 / following-sibling 后兄弟 / ancestor 祖先，contains 模糊匹配更稳"
            }
          ],
          "words": [
            {
              "en": "AXIS",
              "zh": "轴：按节点间关系（父/子/兄弟）定位",
              "pron": "ˈæksɪs"
            },
            {
              "en": "SIBLING",
              "zh": "兄弟节点：同级的前后元素",
              "pron": "ˈsɪblɪŋ"
            },
            {
              "en": "CONTAINS",
              "zh": "contains：判断包含某子串",
              "pron": "kənˈteɪnz"
            }
          ],
          "exercises": [
            {
              "type": "choice",
              "question": "`following-sibling::` 表示？",
              "options": [
                "父节点",
                "后面的兄弟节点",
                "祖先"
              ],
              "answer": 1,
              "explain": "following-sibling 选中同级的后续兄弟。"
            },
            {
              "type": "fill",
              "question": "想匹配「类名包含 item」，用 `______(@class,'item')` 函数。",
              "answer": "contains",
              "explain": "contains(@class,'x') 做子串匹配，不受多 class 顺序影响。"
            },
            {
              "type": "choice",
              "question": "`//div[@class='a b']` 为什么常匹配不到？",
              "options": [
                "顺序敏感要求完全相等",
                "div 不能用",
                "语法错误"
              ],
              "answer": 0,
              "explain": "class 多值时顺序敏感，精确相等很难命中。"
            },
            {
              "type": "tap",
              "question": "下列哪些是 XPath 轴/函数（多选）",
              "options": [
                "parent::",
                "following-sibling::",
                "contains()",
                "position()"
              ],
              "answer": [
                0,
                1,
                2,
                3
              ],
              "explain": "四个都是 XPath 的轴或定位函数。",
              "multi": true
            },
            {
              "type": "open",
              "question": "什么情况你必须用「轴」而不是单纯标签路径？举一个。",
              "answer": "比如要「取某个价格后面的说明文字」，用标签路径很难表达，但 //span[@class='price']/following-sibling::p 一句话就定位到兄弟节点。"
            },
            {
              "type": "coding",
              "question": "用正则把 <a href=\"链接\">文字</a> 的「链接」和「文字」配对，打印成 [(链接,文字),...]。",
              "starter": "import re\nhtml = '<a href=\"http://a.com\">首页</a><a href=\"http://b.com\">新闻</a>'\npairs = []   # TODO: 用 re.findall(r'<a href=\"(.*?)\">(.*?)</a>', html)\nprint(pairs)",
              "_gen": "coding-ex",
              "expect": "http://a.com', '首页"
            }
          ],
          "tasks": [
            "用轴写出「某新闻标题后面那段正文」的 XPath。",
            "把 `[@class='x y']` 改成 contains 重写，对比命中率。",
            "记一句：class 多值用 contains，别精确等于。"
          ],
          "color": "#6a8fd4"
        },
        {
          "id": "a3l3",
          "title": "大规模解析性能优化",
          "icon": "🚀",
          "markdown": "## 抓得快，解析也得跟得上\n\n页面成千上万，解析慢会反成瓶颈。几条实战优化：\n\n### 1. 编译 XPath\n反复用同一条 XPath，先编译再跑，省重复解析表达式：\n```python\nfrom lxml import etree\nxp = etree.XPath(\"//h1/text()\")\nxp(doc)   # 直接调，快\n```\n### 2. 别反复 fromstring\n尽量一次解析、多次 xpath；大文件用 `iterparse` 边读边解，省内存。\n### 3. 只取要的\nXPath 直接定位到目标节点，别先抓整页再 Python 里筛。\n\n> 💡 经验：解析占道时，先用 `cProfile` 看瓶颈；多数情况是「每条 XPath 没编译」或「在 Python 里做本可 XPath 完成的过滤」。",
          "takeaway": "大规模解析优化：编译 XPath 复用、iterparse 流式省内存、XPath 直接定位目标而非整页抓回再筛。先用 cProfile 定位瓶颈。",
          "figures": [
            {
              "key": "adv_xpath_tree",
              "caption": "🚀 性能优化：编译 XPath 复用 + iterparse 流式 + 直接定位，别整页抓回再筛"
            }
          ],
          "words": [
            {
              "en": "COMPILE",
              "zh": "编译：把 XPath 表达式预编译复用",
              "pron": "kəmˈpaɪl"
            },
            {
              "en": "ITERPARSE",
              "zh": "iterparse：边读文件边解析，省内存",
              "pron": "ˈɪtər pɑːrs"
            },
            {
              "en": "PROFILE",
              "zh": "cProfile：给代码计时找瓶颈",
              "pron": "ˈproʊfaɪl"
            }
          ],
          "exercises": [
            {
              "type": "choice",
              "question": "反复用同一条 XPath，怎么提速？",
              "options": [
                "每次重新写",
                "先 etree.XPath 编译再调用",
                "改用正则"
              ],
              "answer": 1,
              "explain": "编译后复用避免重复解析表达式。"
            },
            {
              "type": "fill",
              "question": "超大文件用 `______` 边读边解析，省内存。（填函数名）",
              "answer": "iterparse",
              "explain": "iterparse 流式解析，不会整文件载入内存。"
            },
            {
              "type": "choice",
              "question": "解析成瓶颈时，第一步该？",
              "options": [
                "瞎改",
                "cProfile 看瓶颈在哪",
                "直接加机器"
              ],
              "answer": 1,
              "explain": "先量化瓶颈，再针对性优化。"
            },
            {
              "type": "tap",
              "question": "下列哪些能提升解析性能（多选）",
              "options": [
                "编译 XPath",
                "用 iterparse 流式解析",
                "XPath 直接定位目标",
                "每次 fromstring 整页"
              ],
              "answer": [
                0,
                1,
                2
              ],
              "explain": "前三个提速；每次整页 fromstring 反而浪费。",
              "multi": true
            },
            {
              "type": "open",
              "question": "为什么「在 Python 里筛」比「XPath 直接定位」慢？",
              "answer": "XPath 在 C 层（lxml）直接定位目标节点，只返回要的数据；在 Python 里先取整页再过滤，多了序列化/循环开销，量大时差距明显。"
            },
            {
              "type": "coding",
              "question": "给定 1000 个商品价格，分别用「列表推导」和「for 循环」过滤出 >100 的，打印两种方式得到的数量（应相等）。",
              "starter": "prices = list(range(1, 1001))\nby_lc = [p for p in prices if p > 100]   # 列表推导\nby_loop = []\nfor p in prices:            # TODO: 把 >100 的加进 by_loop\n    if p > 100:\n        by_loop.append(p)\nprint('推导', len(by_lc), '循环', len(by_loop))",
              "_gen": "coding-ex",
              "expect": "推导 900 循环 900"
            }
          ],
          "tasks": [
            "把一条常用 XPath 用 etree.XPath 编译，跑 1 万次对比耗时。",
            "用 iterparse 解析一个大 XML，观察内存占用。",
            "记住：瓶颈先 cProfile 再动手。"
          ],
          "color": "#6a8fd4"
        },
        {
          "id": "a3l4",
          "title": "parsel：Scrapy 同款解析器",
          "icon": "🛠️",
          "markdown": "## parsel：Scrapy 同款解析器\n\nScrapy 内部用的就是 **parsel**（底层也是 lxml）。它把 XPath 和 CSS 选择器包成一套顺手的 API，写爬虫极舒服。\n\n### 两种选择器都能用\n```python\nfrom parsel import Selector\nsel = Selector(text=html_text)\nsel.xpath(\"//h1/text()\").get()        # 取第一个\nsel.xpath(\"//h1/text()\").getall()     # 取全部\nsel.css(\"h1::text\").get()             # CSS 也能用\n```\n- `.get()` 取一个，`.getall()` 取全部\n- 既能 XPath 又能 CSS，随意切\n\n> 💡 学到 Scrapy 那章你会发现：`response.xpath(...)` 几乎是同一个味道——因为底层就是 parsel。",
          "takeaway": "parsel 是 Scrapy 同款解析器（底层 lxml），同时支持 XPath 与 CSS，.get() 取一个、.getall() 取全部。学了它，Scrapy 的 response.xpath 无缝衔接。",
          "figures": [
            {
              "key": "adv_xpath_tree",
              "caption": "🛠️ parsel 同款：XPath 与 CSS 通吃，.get() 取一 .getall() 取全，Scrapy 底层就用它"
            }
          ],
          "words": [
            {
              "en": "PARSEL",
              "zh": "parsel：Scrapy 内置的解析库",
              "pron": "ˈpɑːrsəl"
            },
            {
              "en": "SELECTOR",
              "zh": "Selector：parsel 的选择器对象",
              "pron": "sɪˈlɛktər"
            },
            {
              "en": "GETALL",
              "zh": "getall：取所有匹配结果",
              "pron": "ɡɛt ɔːl"
            }
          ],
          "exercises": [
            {
              "type": "choice",
              "question": "parsel 底层基于？",
              "options": [
                "regex",
                "lxml",
                "BeautifulSoup"
              ],
              "answer": 1,
              "explain": "parsel 构建于 lxml 之上。"
            },
            {
              "type": "fill",
              "question": "取全部匹配用 `.______()`，取第一个用 `.get()`。",
              "answer": "getall",
              "explain": "getall 返回列表，get 返回单个。"
            },
            {
              "type": "choice",
              "question": "parsel 同时支持？",
              "options": [
                "只 XPath",
                "只 CSS",
                "XPath 和 CSS 都行"
              ],
              "answer": 2,
              "explain": "parsel 两套选择器都支持。"
            },
            {
              "type": "tap",
              "question": "下列哪些是 parsel 用法（多选）",
              "options": [
                "Selector(text=...)",
                ".xpath().get()",
                ".css().getall()",
                "response 里也能用"
              ],
              "answer": [
                0,
                1,
                2,
                3
              ],
              "explain": "四个都是 parsel/Scrapy 的常见用法。",
              "multi": true
            },
            {
              "type": "open",
              "question": "为什么说「先学 parsel，Scrapy 上手零成本」？",
              "answer": "因为 Scrapy 的 response 对象直接提供 .xpath/.css/.get/.getall，和 parsel 完全一致，提前练熟到 Scrapy 章节直接无缝衔接。"
            },
            {
              "type": "coding",
              "question": "parsel 用 CSS 选择器提取。这里用正则模拟：提取所有 <h2>标题</h2> 里的文字，打印列表。",
              "starter": "import re\ndoc = '<h2>第一章</h2><p>正文</p><h2>第二章</h2>'\ntitles = re.findall(r'<h2>(.*?)</h2>', doc)\nprint(titles)",
              "_gen": "coding-ex",
              "expect": "['第一章', '第二章']"
            }
          ],
          "tasks": [
            "装 parsel，用 XPath 和 CSS 两种方式抠同一个页面的标题。",
            "对比 .get() 和 .getall() 的返回差异。",
            "记一句：parsel = Scrapy 的亲儿子。"
          ],
          "color": "#6a8fd4"
        },
        {
          "id": "exam1",
          "title": "阶段考①：异步·httpx·XPath",
          "icon": "📝",
          "type": "exam",
          "color": "#e0922f",
          "markdown": "## 阶段考①：异步 · httpx · XPath\n\n这一考覆盖 **异步爬虫基础 / httpx 与现代客户端 / 高效解析 XPath** 三章。\n\n**规则**：8 题，首次作答正确率 ≥ 80%（至少 7 题首次即对）才能过关，获得「阶段考①过关」勋章。没过关可以回去复习、重新挑战，不限次数。\n\n把异步和解析的底层逻辑踩实，后面才跑得稳！",
          "takeaway": "阶段考①过关 = 你真懂了 I/O 等待为何慢、asyncio 怎么并发、信号量限的是并发不是速度、httpx 连接池复用、XPath 轴与函数精准抠数据。底层稳了。",
          "words": [],
          "tasks": [],
          "exercises": [
            {
              "type": "choice",
              "question": "爬虫慢的主因是？",
              "options": [
                "CPU 算力不够",
                "I/O 等待（等网络）",
                "Python 太慢"
              ],
              "answer": 1,
              "explain": "90% 时间在等网络，不是算。"
            },
            {
              "type": "choice",
              "question": "GIL 背不背爬虫慢的锅？",
              "options": [
                "背，GIL 限了 I/O",
                "不背，GIL 限 CPU 并行，爬虫瓶颈是 I/O",
                "完全无关"
              ],
              "answer": 1,
              "explain": "GIL 卡的是计算并行，爬虫卡的是等待。"
            },
            {
              "type": "fill",
              "question": "异步函数里，真正会挂起等待的关键字是______。（填 await/async）",
              "answer": "await",
              "explain": "await 才挂起等结果；async 只是声明协程。"
            },
            {
              "type": "choice",
              "question": "在 asyncio 事件循环里调用同步阻塞函数（如 time.sleep）会？",
              "options": [
                "没事",
                "卡住整个事件循环，其他协程也动不了",
                "自动变异步"
              ],
              "answer": 1,
              "explain": "同步阻塞会占住线程，协程全卡。"
            },
            {
              "type": "choice",
              "question": "信号量(Semaphore)的作用是？",
              "options": [
                "让爬虫更快",
                "限制同时并发数（限流防封）",
                "去重"
              ],
              "answer": 1,
              "explain": "信号量=限并发，不是提速。"
            },
            {
              "type": "choice",
              "question": "httpx 相比 requests 的独特优势是？",
              "options": [
                "只能同步",
                "同步异步一体 + 连接池复用",
                "不支持异步"
              ],
              "answer": 1,
              "explain": "httpx 一套代码同步异步都能跑。"
            },
            {
              "type": "choice",
              "question": "遇到 429（请求过多），正确做法是？",
              "options": [
                "立刻猛刷",
                "指数退避后重试",
                "放弃"
              ],
              "answer": 1,
              "explain": "429 要退避，猛刷只会被封更久。"
            },
            {
              "type": "fill",
              "question": "XPath 中 `//div[@class='a']/text()` 的 `/text()` 用来取______。（填 文本/属性）",
              "answer": "文本",
              "explain": "/text() 取标签内文字。"
            },
            {
              "type": "choice",
              "question": "想取某节点「父节点」，XPath 用？",
              "options": [
                "//child",
                "parent:: 或 /..",
                "//sibling"
              ],
              "answer": 1,
              "explain": "parent:: 或 .. 取父。"
            },
            {
              "type": "choice",
              "question": "parsel 和 Scrapy 的关系是？",
              "options": [
                "毫无关系",
                "parsel 是 Scrapy 同款解析库",
                "parsel 是数据库"
              ],
              "answer": 1,
              "explain": "parsel 就是 Scrapy 用的解析库，XPath/CSS 都行。"
            }
          ]
        }
      ]
    },
    {
      "title": "毕业项目预览（学完能做这些）",
      "lessons": [
        {
          "id": "gradA",
          "title": "毕业项目 A：高并发异步采集",
          "icon": "🚀",
          "markdown": "## 毕业项目 A：高并发异步采集系统\n\n把前 13 章串起来，做一个**能并发抓成千上万个页面**的异步采集器。目标：用 asyncio + aiohttp + 信号量 + 退避，稳定高效。\n\n### 你要做\n1. 选一个**你有权抓**的公开站点（如某公开榜单/文档站）\n2. 设计 URL 生成器（列表页 → 详情页）\n3. 用 aiohttp + Semaphore 并发抓，429 退避\n4. 用 lxml/parsel 解析，落 MongoDB 或 CSV\n5. 加日志、断点续爬、限速\n\n### 验收点\n| 能力 | 对应章节 |\n|---|---|\n| 异步并发 | ch1-2 |\n| 解析 | ch3 |\n| 限速/退避 | ch2/ch9 |\n| 存储 | ch10 |\n| 工程化 | ch12 |\n\n> 💡 这个项目考的是「组合能力」：单点你都会，难点在把它们稳稳拼起来、不崩、不封。",
          "takeaway": "毕业项目A=用 asyncio+aiohttp+Semaphore+退避 搭建高并发异步采集器，串起并发/解析/限速/存储/工程化；难点在稳稳组合、不崩不封。",
          "figures": [
            {
              "key": "adv_grad_arch",
              "caption": "🚀 毕业项目A：异步并发采集架构 asyncio+aiohttp+信号量+退避→解析→存储"
            }
          ],
          "words": [
            {
              "en": "PROJECT",
              "zh": "项目：综合运用的毕业实战",
              "pron": "ˈprɑːdʒɛkt"
            },
            {
              "en": "CONCURRENT_CRAWL",
              "zh": "高并发采集：同时抓大量页面",
              "pron": "kənˈkʌrənt krɔːl"
            },
            {
              "en": "ACCEPTANCE",
              "zh": "验收：项目达标的检查点",
              "pron": "əkˈsɛptəns"
            }
          ],
          "exercises": [
            {
              "type": "choice",
              "question": "毕业项目 A 的核心技术是？",
              "options": [
                "Selenium 点点点",
                "asyncio+aiohttp+信号量",
                "手工复制"
              ],
              "answer": 1,
              "explain": "异步并发是 A 的主题。"
            },
            {
              "type": "fill",
              "question": "高并发采集用______控制同时并发数防冲垮。（填 信号量/Semaphore）",
              "answer": "信号量|Semaphore",
              "explain": "Semaphore 限制并发。"
            },
            {
              "type": "choice",
              "question": "关于项目 A 的验收，正确的是？",
              "options": [
                "只看速度",
                "稳定+不封+能存",
                "不管合规"
              ],
              "answer": 1,
              "explain": "稳定合规可存才是合格。"
            },
            {
              "type": "tap",
              "question": "项目 A 要用到的能力（多选）",
              "options": [
                "异步并发",
                "解析",
                "限速退避",
                "存储落库"
              ],
              "answer": [
                0,
                1,
                2,
                3
              ],
              "explain": "五章能力综合。",
              "multi": true
            },
            {
              "type": "open",
              "question": "为什么「组合能力」比「单点会」更难也更重要？",
              "answer": "单点技术各自独立好掌握，但真实项目要并发、解析、限速、存储、工程化一起跑且互不拖垮，任何一环不稳整体就崩，组合才是工程能力的分水岭。"
            },
            {
              "type": "coding",
              "question": "毕业项目 A 是高并发异步采集器（完整代码在上方「完整代码」框）。这里用模拟数据体会「并发 vs 顺序」速度差：给定 8 个任务每个 1 秒，算顺序与并发总耗时打印。",
              "starter": "n = 8\nper = 1\nseq = per * n\ncon = per\nprint('顺序', seq, '秒；并发', con, '秒')",
              "_gen": "coding-ex",
              "expect": "顺序 8 秒"
            }
          ],
          "tasks": [
            "选一个你有权抓的公开站，列出「列表页→详情页」的 URL 规律。",
            "用 asyncio+aiohttp+Semaphore 写出并发骨架，先小批量试。",
            "逐步加上 退避/解析/落库/日志/断点续爬，做成完整项目。"
          ],
          "color": "#58b368",
          "code": "# 毕业项目 A：高并发异步采集器（完整可运行示例）\n# 安装依赖：pip install aiohttp\n# 合规提醒：只抓你有权抓的公开站点，控制并发、尊重 robots、加延时。\nimport asyncio, aiohttp, csv, time\n\nTARGETS = [\n    \"https://example.com/page/1\",\n    \"https://example.com/page/2\",\n    # 换成你有权抓的「列表页 -> 详情页」URL\n]\nCONCURRENCY = 8      # 同时并发数（信号量控制）\nTIMEOUT = 15\nOUT = \"result.csv\"\n\nsemaphore = asyncio.Semaphore(CONCURRENCY)\nrows = []\nsess = None\n\nasync def fetch(url):\n    async with semaphore:                      # 限流：别冲垮对方\n        for attempt in range(3):               # 失败重试\n            try:\n                async with sess.get(url, timeout=TIMEOUT) as r:\n                    if r.status == 429:         # 被限流 -> 退避后重试\n                        await asyncio.sleep(2 ** attempt + 1)\n                        continue\n                    r.raise_for_status()\n                    return await r.text()\n            except Exception as e:\n                await asyncio.sleep(1.5 * (attempt + 1))\n    return None\n\ndef parse(html):\n    # 用 parsel / lxml / bs4 / re 解析出你要的字段\n    return {\"len\": len(html) if html else 0}\n\nasync def worker(url):\n    html = await fetch(url)\n    if html:\n        rows.append(parse(html))\n\nasync def main():\n    global sess\n    async with aiohttp.ClientSession() as sess:\n        t0 = time.time()\n        await asyncio.gather(*(worker(u) for u in TARGETS))\n        print(f\"抓了 {len(rows)} 页，用时 {time.time()-t0:.1f}s\")\n    with open(OUT, \"w\", newline=\"\", encoding=\"utf-8\") as f:\n        w = csv.DictWriter(f, fieldnames=[\"len\"])\n        w.writeheader(); w.writerows(rows)\n\nif __name__ == \"__main__\":\n    asyncio.run(main())\n",
          "codeCopyOnly": true
        },
        {
          "id": "gradB",
          "title": "毕业项目 B：分布式 + ES 入库",
          "icon": "🏗️",
          "markdown": "## 毕业项目 B：分布式 + ES 入库\n\n在 A 的基础上加难度：数据量更大，要**多机分布式**抓，并写入 **Elasticsearch** 支持检索。\n\n### 你要做\n1. 用 Redis 做中央队列 + 去重（scrapy-redis 或手写）\n2. 多进程/多机协作抓\n3. 文本近似去重（SimHash）避免重复\n4. 清洗后写入 ES，建立索引可检索\n5. 用 Docker 打包，Scrapyd 管理\n\n### 验收点\n| 能力 | 对应章节 |\n|---|---|\n| 分布式/去重 | ch9 |\n| 存储/ES | ch10 |\n| 部署 | ch12 |\n| 合规 | ch13 |\n\n> 💡 B 考的是「规模与工程」：当数据从千到千万，架构（队列/去重/检索/部署）才是分水岭。",
          "takeaway": "毕业项目B=在A基础上加 Redis 中央队列/去重、多机分布式、SimHash 近似去重、清洗写 ES 检索、Docker+Scrapyd 部署；考规模与工程架构。",
          "figures": [
            {
              "key": "adv_grad_arch",
              "caption": "🏗️ 毕业项目B：Redis队列+多机分布式+SimHash去重+ES检索+Docker部署"
            }
          ],
          "words": [
            {
              "en": "DISTRIBUTED",
              "zh": "分布式：多机协作抓",
              "pron": "dɪˈstrɪbjuːtɪd"
            },
            {
              "en": "ELASTIC",
              "zh": "ES：检索入库",
              "pron": "ɪˈlæstɪk"
            },
            {
              "en": "PRODUCTION",
              "zh": "生产级：能稳定常驻运行",
              "pron": "prəˈdʌkʃən"
            }
          ],
          "exercises": [
            {
              "type": "choice",
              "question": "毕业项目 B 相比 A 多了什么？",
              "options": [
                "更少功能",
                "分布式+ES 检索",
                "不用存储"
              ],
              "answer": 1,
              "explain": "规模与检索是 B 的增量。"
            },
            {
              "type": "fill",
              "question": "分布式用______做中央队列与去重。（填 Redis）",
              "answer": "Redis",
              "explain": "Redis 做队列与去重中枢。"
            },
            {
              "type": "choice",
              "question": "写入 ES 的目的是？",
              "options": [
                "装饰",
                "支持全文检索",
                "更慢"
              ],
              "answer": 1,
              "explain": "ES 为搜索。"
            },
            {
              "type": "tap",
              "question": "项目 B 能力（多选）",
              "options": [
                "Redis 中央队列",
                "多机协作",
                "SimHash 去重",
                "ES 检索"
              ],
              "answer": [
                0,
                1,
                2,
                3
              ],
              "explain": "四块增量能力。",
              "multi": true
            },
            {
              "type": "open",
              "question": "为什么「架构」在千万级数据时是分水岭？",
              "answer": "千级数据单机字典去重、CSV 存储都够；千万级时内存、去重、检索、部署任一短板都会让系统崩溃或慢到不可用，只有合理架构（队列/去重/检索/容器）扛得住。"
            },
            {
              "type": "coding",
              "question": "毕业项目 B 是分布式+ES 入库（完整代码在上方）。这里用 deque 模拟「中央队列+多 worker」：把 6 个任务入队，3 个 worker 轮流 popleft 打印。",
              "starter": "from collections import deque\nq = deque(['t1','t2','t3','t4','t5','t6'])\nwhile q:\n    print('worker 取走', q.popleft())",
              "_gen": "coding-ex",
              "expect": "worker 取走 t1"
            }
          ],
          "tasks": [
            "把项目 A 改造成 Redis 中央队列版，起两个进程协作。",
            "加 SimHash 去重，清洗后写入 ES 建索引。",
            "用 Docker 打包并用 Scrapyd 管理起来。"
          ],
          "color": "#58b368",
          "code": "# 毕业项目 B：分布式采集 + ES 入库（生产架构骨架）\n# 安装依赖：pip install redis elasticsearch simhash requests\n# 说明：需本地先起 Redis 与 Elasticsearch；下面演示\n#       「Redis 中央队列 + 多进程 worker + SimHash 近似去重 + 写 ES」。\nimport redis, requests, multiprocessing as mp\nfrom elasticsearch import Elasticsearch\nfrom simhash import Simhash\n\nr = redis.Redis(host=\"127.0.0.1\", port=6379, db=0)\nes = Elasticsearch(\"http://127.0.0.1:9200\")\nQUEUE = \"crawl:tasks\"\nSEEN = \"crawl:simhash\"\n\ndef push_urls(urls):\n    r.lpush(QUEUE, *urls)               # 种子 URL 进中央队列（多机共享）\n\ndef fetch_sync(url):\n    return requests.get(url, timeout=15).text\n\ndef sim_dup(text):\n    h = Simhash(text).value\n    for old in r.sscan_iter(SEEN):      # 汉明距离 < 3 视为近似重复\n        if bin(h ^ int(old)).count(\"1\") < 3:\n            return True\n    r.sadd(SEEN, str(h))\n    return False\n\ndef worker():\n    while True:\n        url = r.rpop(QUEUE)\n        if not url: break\n        html = fetch_sync(url)\n        if html and not sim_dup(html):\n            es.index(index=\"docs\", document={\"url\": url, \"text\": html[:10000]})\n\nif __name__ == \"__main__\":\n    push_urls([\"https://example.com/a\", \"https://example.com/b\"])\n    procs = [mp.Process(target=worker) for _ in range(4)]   # 4 个进程协作\n    for p in procs: p.start()\n    for p in procs: p.join()\n",
          "codeCopyOnly": true
        }
      ]
    }
  ]
};