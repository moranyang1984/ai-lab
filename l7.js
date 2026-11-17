/* 第7讲 诗词工坊 (v3) — 字的好搭档 / 拼一首积木诗 / EXP-01 诗词工坊 / EXP-02 提示词对比器 / EXP-03 AI 仿写李白 / EXP-03b 李白对 AI / EXP-04 人机对决墙 / TALK / EXP-05 改写定稿 */
(function(){
const {$,$$,esc,clamp}=App;const K='l7';const L={};App.lessons[K]=L;
const MODE={api:'平台 AI 接口',claude:'Claude 大模型',gpt:'GPT 大模型'};
const srcOf=m=>!m||m==='offline'?'离线示例':(MODE[m]||m);
const A=s=>[...String(s??'')];
const cut=(s,n)=>{const a=A(s);return a.length>n?a.slice(0,n).join('')+'…':a.join('');};
const clip=(s,n=600)=>A(String(s||'').trim()).slice(0,n).join('');
const HZ=/[一-鿿]/;
const hash=s=>{let h=2166136261;for(const c of String(s)){h^=c.codePointAt(0);h=Math.imul(h,16777619);}return h>>>0;};
const rng=seed=>{let a=(seed>>>0)||1;return()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};};
const COLS=['#4cc9f0','#90be6d','#f9c74f','#9d8cff','#f8961e','#f25c78'];

/* ---------- rhyme groups (approximate, by Mandarin finals; tones not checked) ---------- */
const RN={a:'a 韵',o:'o/e 韵',ie:'ie/üe 韵',ai:'ai 韵',ei:'ei/ui 韵',ao:'ao 韵',ou:'ou/iu 韵',an:'an 韵',en:'en/in/un 韵',ang:'ang 韵',eng:'eng/ing/ong 韵',i:'i/ü 韵',u:'u 韵'};
const RCH={
 a:'花家霞芽华下画洒挂沙涯纱夏茶瓜话达发牙鸭马爬大怕那拉架价假夸塔踏霎桠虾哗刷嘉佳葭笳琶蛙娃纳插擦察差查叉渣扎乍诧杀煞拔罢八巴吧把爸霸芭疤麻骂妈码啊呀哪',
 o:'歌河荷多落波坡朵果火我过和鹅窝阔色客乐热格刻隔薄磨坐座错说破摸课科可渴哥个各合盒禾何喝贺鹤车遮者折哲社舍蛇射设奢惹德得特勒责泽择册策测则泊博搏魄婆陀罗萝锣螺骆络洛索锁所琐托拖脱妥拓佛默墨陌抹莫没漠寞蓑娑梭国郭锅裹活获货祸惑伙或握沃卧捉桌灼卓啄浊作昨做左佐挫措蹉搓了着的呢么壑',
 ie:'月雪叶蝶夜节野谢鞋街写别接斜切些绝缺学约越悦阅页铁贴帖跌爹叠谍灭烈裂猎列劫杰结洁捷姐借解界戒介届且窃怯妾歇协胁血穴决诀觉爵掘雀确鹊却阙靴削岳跃粤耶爷也冶业邪械',
 ai:'开来白台苔埃海在带爱外彩改怀排菜才栽待摘采拍腮柴埋买卖迈脉麦派牌败拜百摆赛塞灾哉宰载再猜材财裁睬踩赖莱乃奈耐太态泰抬胎怠代袋戴黛该概盖慨凯楷衰帅摔甩快块筷怪乖拐坏淮槐徊歪',
 ei:'飞回归辉微晖水美醉吹垂追随谁泪内背杯推堆催翠碎岁味位围违薇扉菲肥非绯梅眉媒霏贵桂规龟鬼柜跪亏葵魁愧溃会汇绘灰挥徽毁悔晦慧惠蕙卉最罪嘴锤槌坠缀睡税瑞蕊锐类累雷蕾北被备悲碑贝辈配佩陪培赔沛黑给贼威危为维伟尾未魏慰卫畏胃谓喂惟唯',
 ao:'桃梢腰摇遥霄高好小草鸟笑跑袍苗早照跳飘娇桥潮晓巧绕道到老少毛帽刀宝闹俏烧涛骄交消脚萧箫潇宵逍销嚣肖孝效校啸标表描瞄秒妙庙料聊辽寥疗尿袅刁雕调掉钓凋条挑眺焦礁蕉椒狡饺缴叫轿较教敲瞧樵乔翘窍邀妖瑶尧谣窑舀要耀药招昭朝兆罩赵超抄吵炒劳牢涝捞稍勺绍哨饶扰膏糕稿告考靠拷烤豪毫号浩耗操曹槽糟枣澡藻灶燥躁骚扫嫂臊包胞饱抱报暴豹抛泡炮猫茅锚卯冒貌倒岛导稻盗滔掏逃陶淘讨套脑恼熬袄傲奥懊',
 ou:'柳流头楼游秋舟收愁柔州留悠走手有久后口透友九酒球求牛油丘鸥首漏斗够瘦绸周洲粥轴肘宙皱昼骤抽仇筹酬丑臭兽受授寿售守熟揉肉谋眸某侯喉猴吼厚候沟钩狗构购勾抠扣寇叩偷投兜抖陡豆逗楼搂陋奏揍凑搜嗽叟修羞秀袖绣锈休朽嗅囚邱鳅纠究揪旧就舅刘琉榴硫六溜扭纽钮由邮犹忧优幽尤又右幼诱',
 an:'烟川天山间前边年田泉眠然莲帆船闲寒看南谈蓝岸远点现见面片转暖线眼甜欢澜端弯湾关还满散漫览颜言仙千连先鲜篇弦园圆源原元缘院换乱万岩盘潭丹残半返宽观环卷全旋喧宣选怨愿晚碗伴干甘竿肝杆赶敢感刊堪砍汗韩含函喊旱翰安按案暗庵担单胆旦但弹淡蛋滩摊坛坦叹探炭男难兰栏拦篮懒烂滥参蚕惭灿三伞删衫闪善扇繁凡烦反范饭犯番翻般搬斑板版办扮瓣盼潘攀判畔蛮曼慢瞒占站战展沾斩产铲缠蝉颤燃染编鞭变便遍辨扁偏翩骗绵棉免勉缅店电殿颠典填添舔念粘帘怜联链脸练恋炼尖坚肩煎兼件建剑健渐践荐简检减钱迁牵铅签浅欠歉嵌咸嫌显险限献县宪陷羡延沿盐研演艳燕宴验焰雁短断段锻缎团湍鸾卵钻纂酸算蒜官冠馆管惯灌罐贯款唤患缓幻焕完玩顽腕专砖赚传穿喘串拴涮栓软阮捐娟倦眷圈权拳劝犬悬玄渊员端',
 en:'春人门云新心林音金真晨尘身魂痕根村闻纹分吞温深阴寻群裙亲民仁神轮唇准纯敏进近品运韵问寸本粉嫩恨很跟肯垦恳狠恩针珍阵镇振震诊陈辰沉臣衬趁申审婶甚肾慎忍刃认任森怎岑奔笨盆喷闷们芬纷坟份奋愤宾滨彬贫频聘您临邻淋琳鳞今斤巾筋紧锦仅尽劲晋浸侵琴勤秦禽寝欣辛信因银引饮印隐屯豚顿蹲盾钝敦论伦沦尊遵存孙损笋昏婚浑混滚棍昆坤困文稳吻蠢顺润闰军君均菌俊峻勋熏巡训迅讯晕匀允孕',
 ang:'光香长阳芳塘方墙窗霜乡扬唱望上样想亮响浪忙黄江凉量场堂房床双翔羊洋航章苍茫狂藏装庄梁粮强旁放状帐涨仗庞冈岗港钢杠康扛抗炕杭昂当党挡荡汤唐糖躺烫趟囊郎狼廊朗桑嗓丧仓舱脏葬帮邦榜棒傍膀谤胖滂芒盲莽防访仿纺张彰掌丈杖账胀昌常尝厂畅伤商赏尚让嚷壤将浆疆奖讲匠降酱枪腔抢相厢箱湘详祥享向象像巷项央秧杨仰养氧漾娘酿粱两谅辆晾广逛筐况旷框矿荒慌皇凰煌晃谎汪王网往忘旺妄桩壮撞闯创爽妆裳',
 eng:'风声生明青星晴情鸣停灵轻影景静听庭晶萍城成行程峰层蜂红东中空虫浓葱松钟动梦冬通同涌笼胧龙宫弓冲重从洞用送种懂匆翁崩朋棚蓬篷碰猛蒙盟登灯等瞪腾疼藤能冷增曾蹭僧耕更庚坑哼横衡恒争征蒸整正证政郑称撑诚乘承呈升牲胜圣绳省扔仍兵冰丙饼病并平评苹凭瓶屏名铭命丁顶鼎定订厅亭挺艇宁凝令玲铃陵零领岭另京经惊精井警境敬净竞清倾请庆兴形型醒幸姓性英鹰迎营蝇赢硬映冻铜童统痛桶农弄隆垄宗综总纵聪丛宋颂工公功攻恭共贡孔控恐洪虹宏轰哄忠终肿众崇宠充荣容融溶熔绒穷琼雄熊胸兄凶永泳勇庸拥',
 i:'衣溪枝时诗迟离西低泥啼期依稀题丝知痴池里地气意起语雨绿曲去鱼区趣序絮女句聚旅侣许举居谜米你几立逸息细戏机鸡积基迹及急集极级己挤记纪技季寄济际继其齐奇骑棋旗启器汽弃企希惜锡席习喜洗系一医移遗疑以已椅艺忆议亦异易益义逼鼻比笔必毕闭壁碧避皮疲脾匹迷秘密蜜滴敌笛底抵弟帝第递梯提蹄体替涕倪逆溺腻犁梨理礼力丽利励例粒历厉璃之汁支只织蜘直值职植执纸指止旨志至置治制智致秩吃驰持尺齿耻斥赤翅师狮施湿失十实识食石拾史使始驶士氏世市示式事试视是适释室誓日资姿兹紫子仔字自词辞瓷此次刺思私斯司死四寺似饲局菊橘巨具剧拒距驱屈渠取娶虚须需徐叙绪续于余娱渔愉与宇羽玉育狱浴预欲遇域寓裕驴吕屡律虑率儿而耳尔二',
 u:'雾路树处舞鼓湖珠竹屋古入出图步读部渡度素露谷足书孤无呼母祖布不捕补哺扑铺仆朴普谱浦木目牧墓幕慕暮亩夫肤孵扶服浮福府腐父付妇负附复富腹赴都督毒独堵赌杜肚突徒途涂土吐兔奴努怒卢芦炉鲁陆录鹿租族组阻粗醋促苏俗诉速宿塑姑估股骨故固顾雇哭枯苦库裤酷乎忽胡壶蝴虎户护互朱株猪主煮嘱住注驻柱祝著初除厨锄础楚叔舒输属鼠数术述束如乳辱乌污吴梧五午武伍物务误悟酥鹭'};
const RM={};Object.entries(RCH).forEach(([g,s])=>{for(const c of s)if(!(c in RM))RM[c]=g;});
const endChar=l=>{const a=A(l).filter(c=>HZ.test(c));return a[a.length-1]||'';};
const rg=c=>RM[c]||'';
function rhymeOf(lines){const ends=lines.map(l=>{const c=endChar(l);return {c,g:rg(c)};});
 const ev=ends.filter((_,i)=>i%2===1);const cnt={};ev.forEach(e=>{if(e.g)cnt[e.g]=(cnt[e.g]||0)+1;});
 const top=Object.entries(cnt).sort((a,b)=>b[1]-a[1])[0];return {ends,top:top?top[0]:'',share:ev.length&&top?top[1]/ev.length:0};}

/* ---------- text helpers ---------- */
function poemLines(t){let s=String(t||'').replace(/\r/g,'').replace(/[*#`>_]/g,'').trim();let ls=s.split('\n').map(x=>x.trim()).filter(Boolean);let title='';
 if(ls.length>1&&(/^《[^》]{1,24}》$/.test(ls[0])||/^(题目|标题)[:：]/.test(ls[0]))){title=ls.shift().replace(/^(题目|标题)[:：]\s*/,'').replace(/[《》]/g,'');}
 ls=ls.filter(l=>HZ.test(l)&&!/^(注|说明|解析|这首诗|以上|创作说明)/.test(l)&&!/^[（(].*[）)]$/.test(l)).slice(0,24);return {title,lines:ls};}
function clsLines(t){const {title,lines}=poemLines(t);const segs=lines.join('，').split(/[，。！？；、,.!?;:：\s]+/).map(x=>x.replace(/[^一-鿿]/g,'')).filter(Boolean).slice(0,12);return {title,lines:segs};}
const clean=s=>A(s).filter(c=>HZ.test(c)||/[A-Za-z0-9]/.test(c));

/* ---------- 意象积木（示意版离线生成器的词句库） ---------- */
const IMG=[
 {k:'阳光',w:'温暖的阳光',al:['阳光','太阳','日光','暖阳'],p:['阳光照在窗台上','把课桌晒得暖暖的'],n:['阳光伸出金色的手指','轻轻敲醒熟睡的屋顶'],b:['阳光像一层薄薄的蜂蜜','慢慢涂满整条小巷'],r:['阳光洒落在山冈','给大地披上金衣裳']},
 {k:'小草',w:'青青的小草',al:['小草','青草','草地','绿草','嫩草'],p:['路边的小草冒出了头','青青的，一片连着一片'],n:['小草从泥土里探出脑袋','好奇地打量这个世界'],b:['小草像刚刚睡醒的孩子','揉着眼睛，望着远方'],r:['青青的小草长满操场','踩上去软软的，带着清香']},
 {k:'花朵',w:'盛开的花朵',al:['花朵','花儿','鲜花','百花'],p:['花园里的花朵都开了','红的、黄的、粉的，挤满枝头'],n:['花朵们张开小小的嘴巴','比赛谁笑得最灿烂'],b:['花朵像一盏盏小灯笼','把春天照得亮堂堂'],r:['花朵开满小路两旁','风一吹，到处都是花香']},
 {k:'小鸟',w:'唱歌的小鸟',al:['小鸟','鸟儿','鸟'],p:['小鸟落在电线上','一只，两只，三只'],n:['小鸟站在枝头开音乐会','把好消息告诉每一棵树'],b:['小鸟的歌声像一串串音符','从树梢上一颗颗滚落'],r:['小鸟在枝头歌唱','歌声清脆又响亮']},
 {k:'春风',w:'春风',al:['春风','微风','东风','暖风'],p:['春风从田野那边吹来','吹过河面，吹过我的脸'],n:['春风踮着脚尖走过田野','轻轻推开每一扇窗'],b:['春风像一把温柔的梳子','梳过柳树长长的头发'],r:['春风吹过小小的村庄','吹绿了田野，吹暖了池塘']},
 {k:'柳枝',w:'柳枝',al:['柳枝','柳树','杨柳','柳条','柳'],p:['河边的柳树发芽了','细细的柳枝垂到水面'],n:['柳树姑娘对着小河梳头','长长的辫子在风里飘'],b:['柳枝像绿色的丝带','在风中轻轻地飘扬'],r:['柳枝垂在小河旁','一条一条，随风摇荡']},
 {k:'桃花',w:'桃花',al:['桃花','桃树'],p:['山脚下的桃花开了','粉红粉红的一大片'],n:['桃花在阳光下绽放','害羞地红了脸庞'],b:['桃花像一片片粉色的云','落在了山坡上'],r:['桃花朵朵映着阳光','粉红的花瓣飘进池塘']},
 {k:'燕子',w:'燕子',al:['燕子'],p:['燕子从南方飞回来了','在屋檐下忙着筑巢'],n:['燕子剪开蓝色的天空','给春天捎来一封信'],b:['燕子像一把黑色的小剪刀','在天空中剪出春天的模样'],r:['燕子归来筑新房','叽叽喳喳飞过屋梁']},
 {k:'春雨',w:'春雨',al:['春雨','细雨','小雨','雨'],p:['春雨下了一整夜','早晨的地面湿漉漉的'],n:['春雨悄悄地来了','怕吵醒还在做梦的种子'],b:['春雨像细细的银针','绣绿了田野，绣红了花'],r:['春雨沙沙下了一场','田野喝饱了，泥土也香']},
 {k:'蝴蝶',w:'蝴蝶',al:['蝴蝶'],p:['蝴蝶在花丛里飞来飞去','停一停，又飞走了'],n:['蝴蝶提着彩色的裙子','在花丛里跳舞'],b:['蝴蝶像一朵会飞的花','落在另一朵花上'],r:['蝴蝶飞过花墙','翅膀上沾满花香']},
 {k:'风筝',w:'风筝',al:['风筝'],p:['我们在草地上放风筝','线越放越长'],n:['风筝拉着我的手','一直往天上跑'],b:['风筝像一只彩色的大鸟','在白云旁边飞翔'],r:['风筝飞向远方','带着我的梦想']},
 {k:'小溪',w:'小溪',al:['小溪','溪水','小河','河水'],p:['冰化了，小溪又开始流动','清清的水里能看见石头'],n:['小溪一路唱着歌','跑向远方的大河'],b:['小溪像一条透明的丝带','绕着村子慢慢流淌'],r:['小溪弯弯流过村庄','叮叮咚咚，像在歌唱']}];
const IMGM=Object.fromEntries(IMG.map(m=>[m.k,m]));
const CUS={p:['春天里，我遇见了{w}','它安安静静，让人心里亮堂堂'],n:['{w}伸了个懒腰','笑着对我说：春天到了'],b:['{w}像一封春天寄来的信','每一行都写着新的希望'],r:['{w}在春光里闪着光','把春天的消息悄悄传扬']};
const SENSE=[{l:['空气里有泥土湿湿的味道','远处传来沙沙的雨声'],r:['空气里有泥土的芬芳','远处的鸟叫一声比一声响亮']},{l:['嫩绿的芽，粉白的花','风里飘着淡淡的甜味'],r:['嫩绿的芽，金黄的光','风里飘着淡淡的花香']}];
const FEEL=[{k:'温暖',hit:['暖'],l:[['我站在春天里','心里也暖洋洋的']],r:['我站在春天的中央','心里也暖洋洋']},
 {k:'快乐',hit:['快乐','笑','开心','欢'],l:[['我也想跟着春天奔跑','把笑声撒满整个山坡']],r:['我跟着春天一起歌唱','快乐长出了翅膀']},
 {k:'希望',hit:['希望','种子','明天'],l:[['每一颗种子都在悄悄用力','明天会开出新的花']],r:['每一颗种子都在生长','心里装满新的希望']},
 {k:'惊喜',hit:['原来','发现','惊喜','礼物'],l:[['原来春天一直藏在身边','只是我今天才发现']],r:['原来春天就在身旁','像一份打开的礼物，闪着光']},
 {k:'',hit:[],l:[['春天真美啊','我爱春天'],['到处都是美丽的景色','春天真美啊']],r:['春天真美啊','到处是好风光']}];
const FEELM=Object.fromEntries(FEEL.map(f=>[f.k,f]));
const GENERIC=[{t:'春天',l:['春天来了','花儿开了，草儿绿了','小鸟在树上唱歌','小朋友们在草地上玩耍','到处都是美丽的景色','春天真美啊，我爱春天']},
 {t:'美丽的春天',l:['春风吹，春雨下','大地换上了新衣裳','花红柳绿，鸟语花香','到处一片美好的景象','啊，春天，你真美丽','我们都喜欢你']}];
const PERS=/(笑|唱着|醒|懒腰|踮|对我说|招手|害羞|梳头|捎来|告诉|打量|探出|脑袋|姑娘|跑向|悄悄地来|手指|眨|做梦|拉着|提着|好奇|跳舞|伸出|敲醒|比赛|揉着)/;
const SIM=/(像|好像|仿佛|如同|宛如|似的|犹如)/;
const SENSE_RE=/红|绿|黄|粉|白|蓝|金|紫|香|味|声|响|沙沙|哗哗|叮咚|暖|软|湿|凉|甜/g;
const CLICHE=['春天来了','真美','美丽','我爱','到处','景色','万紫千红','春暖花开','鸟语花香','花红柳绿','美好','生机勃勃','欣欣向荣','五颜六色','新衣裳'];
const cliches=t=>CLICHE.reduce((s,w)=>s+(String(t).split(w).length-1),0);
const CN={'四':4,'六':6,'八':8,'十':10,'十二':12,'十六':16};
function parseP(t,custom=[]){t=String(t||'');const pos=m=>{let b=-1;m.al.forEach(a=>{const i=t.indexOf(a);if(i>=0&&(b<0||i<b))b=i;});return b;};
 const imgs=IMG.map(m=>[m.k,pos(m)]).filter(x=>x[1]>=0).sort((a,b)=>a[1]-b[1]).map(x=>x[0]);
 const cus=(custom||[]).filter(w=>w&&t.includes(w)&&!IMG.some(m=>m.al.some(a=>w.includes(a)))).slice(0,4);
 const fm=/(温暖|快乐|希望|惊喜|开心|喜悦)[^，。！]{0,4}(感受|心情|感觉)|表达[^，。！]{0,6}?(温暖|快乐|希望|惊喜|开心|喜悦)/.exec(t);
 let feel=fm?(fm[1]||fm[3]):'';if(feel==='开心'||feel==='喜悦')feel='快乐';
 const ln=/(\d+|十二|十六|[四六八十])\s*行/.exec(t);const lines=ln?(+ln[1]||CN[ln[1]]||0):0;
 return {imgs,cus,pers:/拟人/.test(t),sim:/比喻|比作/.test(t),det:/具体|颜色|声音|气味|细节/.test(t),rhy:/押韵|韵脚/.test(t),feel,lines:lines>=4&&lines<=16?lines:0};}
/* the offline 「积木」 generator: theme → imagery blocks → sentence templates → rhyme → poem */
function compose(prompt,custom,seed){const P=parseP(prompt,custom);const r=rng(seed);const pick=a=>a[Math.floor(r()*a.length)];
 const any=P.pers||P.sim||P.det||P.rhy||P.feel||P.lines;
 if(!P.imgs.length&&!P.cus.length&&!any){const g=pick(GENERIC);return {text:`《${g.t}》\n`+g.l.join('\n'),bl:g.l.map(()=>'套话'),tk:g.l.map(()=>'g'),P};}
 let items=P.imgs.map(k=>({k,m:IMGM[k]})).concat(P.cus.map(w=>({k:w,cus:1})));
 if(!items.length)items=['阳光','桃花','燕子'].map(k=>({k,m:IMGM[k]}));
 const det=P.det&&(!P.lines||P.lines/2-2>=1);
 let slots=P.lines?Math.max(1,P.lines/2-1-(det?1:0)):Math.min(5,items.length);slots=Math.floor(slots);
 if(items.length>slots)items=items.slice(0,slots);
 const fill=IMG.filter(m=>!items.some(it=>it.k===m.k));while(P.lines&&items.length<slots&&fill.length){const m=fill.splice(Math.floor(r()*fill.length),1)[0];items.push({k:m.k,m});}
 const techs=[P.pers?'n':'',P.sim?'b':''].filter(Boolean);const out=[],bl=[],tk=[];
 items.forEach((it,i)=>{const t=techs.length?techs[i%techs.length]:'p';const src=it.cus?Object.fromEntries(Object.entries(CUS).map(([a,v])=>[a,v.map(s=>s.replace('{w}',it.k))])):it.m;
  let c=src[t],used=t;if(P.rhy&&rg(endChar(c[1]))!=='ang'&&!(i===0&&t!=='p')){c=src.r;used='r';}out.push(...c);bl.push(it.k,it.k);tk.push(used,used);});
 if(det){const s=pick(SENSE);out.push(...(P.rhy?s.r:s.l));bl.push('细节','细节');tk.push('d','d');}
 const f=FEELM[P.feel]||FEELM[''];out.push(...(P.rhy?f.r:pick(f.l)));bl.push(P.feel?'感受':'结尾',P.feel?'感受':'结尾');tk.push('f','f');
 const k0=items[0].k;return {text:`《${k0.startsWith('春')?k0:'春天的'+k0}》\n`+out.join('\n'),bl,tk,P};}
/* 检查器只会找关键词：找到 = ok；没找到 = “没查到”（soft，要学生自己读了再判）；只有行数是数得出来的硬事实（hard）。
   hl = 这一项在诗里的落点（用来加黄底）；rh = 押韵的韵部（把句尾的字加黄底）。 */
function check(text,P){const {lines}=poemLines(text);const body=lines.join('\n');const rows=[];
 P.imgs.forEach(k=>{const a=IMGM[k].al.find(x=>body.includes(x));rows.push({l:k,ok:!!a,ev:a||''});});
 (P.cus||[]).forEach(w=>rows.push({l:w,ok:body.includes(w),ev:body.includes(w)?w:''}));
 if(P.pers){const m=PERS.exec(body);rows.push({l:'拟人',ok:!!m,ev:m?m[0]:'',hl:m?[m[0]]:[]});}
 if(P.sim){const m=SIM.exec(body);rows.push({l:'比喻',ok:!!m,ev:m?m[0]:'',hl:m?[m[0]]:[]});}
 if(P.det){const u=[...new Set(body.match(SENSE_RE)||[])];rows.push({l:'具体画面',ok:u.length>=3,ev:u.slice(0,5).join(''),hl:u.length>=3?u.slice(0,5):[]});}
 if(P.feel){const f=FEELM[P.feel];const m=f.hit.find(w=>body.includes(w));rows.push({l:'感受：'+P.feel,ok:!!m,ev:m||'',hl:m?[m]:[]});}
 if(P.rhy){const r=rhymeOf(lines);const ok=r.share>=0.6&&lines.length>=4;const cs=[...new Set(r.ends.filter((e,i)=>i%2===1&&e.g===r.top).map(e=>e.c))].slice(0,3);
  rows.push({l:'押韵',ok,ev:ok?'句尾 '+cs.join('、'):'',rh:ok?r.top:''});}
 if(P.lines)rows.push({l:P.lines+' 行',ok:lines.length===P.lines,ev:'实际 '+lines.length+' 行',hard:1});
 return rows;}
/* a student's own verdict (ov[label] = 1 写到了 / 0 真的漏了) overrides the keyword checker */
const judged=(rows,ov)=>rows.map(r=>{const o=ov&&ov[r.l];return Object.assign({},r,r.ok?{st:'ok'}:r.hard||o===0?{st:'no'}:o===1?{ok:true,st:'ok',by:1}:{st:'unk'});});
/* line renderer: yellow marks where the checker found each added requirement; coral underline marks 套话 */
const marker=(rows,cl)=>{const ws=[...new Set((rows||[]).filter(r=>r.ok).flatMap(r=>r.hl||[]))].sort((a,b)=>b.length-a.length);const rh=((rows||[]).find(r=>r.ok&&r.rh)||{}).rh;
 return l=>{let a=A(l).map(c=>({c,y:0,u:0}));const txt=a.map(x=>x.c).join('');
  const paint=(w,key,all)=>{const n=A(w).length;let from=0;for(;;){const i=txt.indexOf(w,from);if(i<0)break;const ci=A(txt.slice(0,i)).length;for(let k=0;k<n;k++)a[ci+k][key]=1;if(!all)break;from=i+w.length;}};
  ws.forEach(w=>paint(w,'y',true));if(cl)CLICHE.forEach(w=>paint(w,'u',true));
  if(rh){for(let i=a.length-1;i>=0;i--){if(HZ.test(a[i].c)){if(rg(a[i].c)===rh)a[i].y=1;break;}}}
  let h='',cur='';a.forEach(x=>{const k=(x.y?'y':'')+(x.u?'u':'');if(k!==cur){if(cur)h+='</span>';if(k)h+=`<span class="${x.y?'l7-hl':''}${x.u?' l7-cl':''}">`;cur=k;}h+=esc(x.c);});if(cur)h+='</span>';return h;};};
const anyMark=rows=>(rows||[]).some(r=>r.ok&&((r.hl&&r.hl.length)||r.rh));
const imgCount=t=>IMG.filter(m=>m.al.some(a=>String(t).includes(a))).length;
const chkHTML=rows=>rows.length?`<div class="l7-chk">${rows.map(r=>{const st=r.st||(r.ok?'ok':r.hard?'no':'unk');
  return `<span class="${st}" title="${esc(r.ev)}">${st==='ok'?'✓':st==='no'?'✗':'？'} ${esc(r.l)}${st==='ok'&&r.by?' · 我读出来的':st==='ok'&&r.ev&&r.ev!==r.l?` · ${esc(r.ev)}`:st==='unk'?' · 没查到':r.hard&&r.ev?` · ${esc(r.ev)}`:st==='no'?' · 漏了':''}</span>`;}).join('')}</div>`:'<p class="note">提示词里没有可以自动检查的具体要求。</p>';

/* ---------- 小诗库：17 首写春天的古诗（公版），用来统计“字词组合规律” ---------- */
const CORPUS=[['春晓','孟浩然','唐',['春眠不觉晓','处处闻啼鸟','夜来风雨声','花落知多少']],
 ['咏柳','贺知章','唐',['碧玉妆成一树高','万条垂下绿丝绦','不知细叶谁裁出','二月春风似剪刀']],
 ['村居','高鼎','清',['草长莺飞二月天','拂堤杨柳醉春烟','儿童散学归来早','忙趁东风放纸鸢']],
 ['游园不值','叶绍翁','宋',['应怜屐齿印苍苔','小扣柴扉久不开','春色满园关不住','一枝红杏出墙来']],
 ['惠崇春江晚景','苏轼','宋',['竹外桃花三两枝','春江水暖鸭先知','蒌蒿满地芦芽短','正是河豚欲上时']],
 ['春夜喜雨（节选）','杜甫','唐',['好雨知时节','当春乃发生','随风潜入夜','润物细无声']],
 ['春日','朱熹','宋',['胜日寻芳泗水滨','无边光景一时新','等闲识得东风面','万紫千红总是春']],
 ['绝句','杜甫','唐',['两个黄鹂鸣翠柳','一行白鹭上青天','窗含西岭千秋雪','门泊东吴万里船']],
 ['泊船瓜洲','王安石','宋',['京口瓜洲一水间','钟山只隔数重山','春风又绿江南岸','明月何时照我还']],
 ['绝句','杜甫','唐',['迟日江山丽','春风花草香','泥融飞燕子','沙暖睡鸳鸯']],
 ['钱塘湖春行','白居易','唐',['孤山寺北贾亭西','水面初平云脚低','几处早莺争暖树','谁家新燕啄春泥','乱花渐欲迷人眼','浅草才能没马蹄','最爱湖东行不足','绿杨阴里白沙堤']],
 ['江南春','杜牧','唐',['千里莺啼绿映红','水村山郭酒旗风','南朝四百八十寺','多少楼台烟雨中']],
 ['忆江南（其一）','白居易','唐',['江南好','风景旧曾谙','日出江花红胜火','春来江水绿如蓝','能不忆江南']],
 ['江畔独步寻花（其六）','杜甫','唐',['黄四娘家花满蹊','千朵万朵压枝低','留连戏蝶时时舞','自在娇莺恰恰啼']],
 ['宿新市徐公店','杨万里','宋',['篱落疏疏一径深','树头新绿未成阴','儿童急走追黄蝶','飞入菜花无处寻']],
 ['大林寺桃花','白居易','唐',['人间四月芳菲尽','山寺桃花始盛开','长恨春归无觅处','不知转入此中来']],
 ['春游湖','徐俯','宋',['双飞燕子几时回','夹岸桃花蘸水开','春雨断桥人不度','小舟撑出柳阴来']]];
const CO_CH=['春','风','花','雨','柳','草','莺','水'];
const STOP=new Set('不一之无何是有时处多少欲未能最也者其'.split(''));
function coOf(ch){const cnt={},bi={},ex=[];let n=0;CORPUS.forEach(([t,a,d,ls])=>ls.forEach(l=>{if(!l.includes(ch))return;n++;if(ex.length<4)ex.push([l,t,a,d]);
  A(l).forEach(c=>{if(c!==ch&&!STOP.has(c))cnt[c]=(cnt[c]||0)+1;});const s=A(l);for(let i=0;i<s.length-1;i++){const w=s[i]+s[i+1];if(w.includes(ch))bi[w]=(bi[w]||0)+1;}}));
 return {n,top:Object.entries(cnt).sort((a,b)=>b[1]-a[1]).slice(0,8),bi:Object.entries(bi).filter(x=>x[1]>=2).sort((a,b)=>b[1]-a[1]).slice(0,6),ex};}
const NLINES=CORPUS.reduce((s,p)=>s+p[3].length,0);

/* ---------- 仿写挑战：李白《望庐山瀑布》与离线预置的 AI 仿写 ---------- */
const LIBAI=['日照香炉生紫烟','遥看瀑布挂前川','飞流直下三千尺','疑是银河落九天'];
const IMIT=[['庐山高耸入云端','瀑布飞流挂碧天','水似白龙从上落','声如雷鸣响山间'],['香炉峰上紫烟飘','万丈银河落九霄','飞瀑奔腾三千尺','壮丽山川胜画描'],['九天飞瀑似银河','倾泻庐山万壑多','雪浪翻腾惊白鹭','豪情满怀放高歌']];
const TH=[['壮','庐山瀑布壮丽的景色',1],['乡','诗人思念家乡的心情',0],['别','和朋友依依惜别',0]];
const KW=['香炉峰','紫烟','瀑布','前川','飞流直下','三千尺','银河','九天'];
const MD=[['雄伟壮观',1],['气势磅礴',1],['想象奇特',1],['宁静淡雅',0],['忧伤孤独',0]];
const RD=[['q','气势'],['x','想象力'],['e','情感']];
const IMF=['每句字数整齐','押韵，读起来顺口','借用了原诗的词语','用了很多常见的形容词','想象新奇、出人意料','写出了亲身的感受'];
function borrowed(ai,orig){const o=orig.join('|');const found=[];const L_=ai.join('|');
 for(let n=4;n>=2;n--)orig.forEach(l=>{const a=A(l);for(let i=0;i+n<=a.length;i++){const w=a.slice(i,i+n).join('');if(L_.includes(w)&&!found.some(f=>f.includes(w)))found.push(w);}});
 const set=new Set(A(o).filter(c=>HZ.test(c)));const all=A(L_).filter(c=>HZ.test(c));const same=all.filter(c=>set.has(c)).length;
 return {words:found,same,total:all.length};}
const niceBw=ws=>[...new Set(ws.map(w=>KW.find(k=>w.includes(k))||w))];
function formOf(lines){const r=rhymeOf(lines);const lens=lines.map(l=>A(l).length);
 return {n:lines.length,lens,ends:r.ends,even:lines.length>=4&&r.ends[1].g&&r.ends[1].g===r.ends[3].g,g:lines.length>=4?r.ends[1].g:'',uni:lens.length>0&&lens.every(x=>x===lens[0])};}

/* ---------- 人机对决墙（经典诗均为公版；AI 诗为平台预置的仿写示例） ---------- */
const WALL=[
 {id:'rain',n:'早春小雨',c:{t:'早春呈水部张十八员外（其一）',a:'韩愈',d:'唐',l:['天街小雨润如酥','草色遥看近却无','最是一年春好处','绝胜烟柳满皇都']},ai:['春雨绵绵润万家','青山绿水映朝霞','东风送暖千枝绿','处处莺歌伴落花']},
 {id:'hill',n:'独坐看山',c:{t:'独坐敬亭山',a:'李白',d:'唐',l:['众鸟高飞尽','孤云独去闲','相看两不厌','只有敬亭山']},ai:['青山多秀美','白鸟自翩翩','独坐清风里','心中乐无边']},
 {id:'ferry',n:'春潮野渡',c:{t:'滁州西涧',a:'韦应物',d:'唐',l:['独怜幽草涧边生','上有黄鹂深树鸣','春潮带雨晚来急','野渡无人舟自横']},ai:['溪边芳草绿青青','林中黄鸟唱歌声','春雨潇潇潮水涨','小舟静静水中行']},
 {id:'walk',n:'杏花春风',c:{t:'绝句',a:'志南',d:'宋',l:['古木阴中系短篷','杖藜扶我过桥东','沾衣欲湿杏花雨','吹面不寒杨柳风']},ai:['春日出游过小桥','杏花细雨柳枝摇','微风拂面心欢喜','美丽风光乐逍遥']}];
const WR=['画面具体、新鲜','有真实的感受','想象奇特','能读出作者的经历','用词华丽','押韵、读着顺口','说不清，就是喜欢'];
const STANCE=[['yes','能，和诗人写的一样动人'],['some','有时能，但常常少了真情实感'],['no','很难，它没有真实的经历和感受']];
const APPS=['写贺卡祝福语','写作文提纲','编小故事','写通知和邮件','起标题、写广告语','整理读书笔记'];
const ADDS=[['det','具体意象'],['pers','拟人'],['sim','比喻'],['feel','某种感受'],['rhy','押韵'],['lines','行数']];
const ADDT={det:'多写具体的画面，写出颜色、声音或气味。',pers:'用拟人的手法，让景物像人一样会说、会笑、会做事。',sim:'用上比喻句，把景物比作另一样东西。',rhy:'每两行的最后一个字尽量押韵。'};
const addSentence=(a)=>[a.det?ADDT.det:'',a.pers?ADDT.pers:'',a.sim?ADDT.sim:'',a.feel?`表达出${a.feel}的感受。`:'',a.rhy?ADDT.rhy:'',a.lines?`一共写 ${a.lines} 行。`:''].filter(Boolean).join('');
const addKeys=a=>[a.det&&'det',a.pers&&'pers',a.sim&&'sim',a.feel&&('feel:'+a.feel),a.rhy&&'rhy',a.lines&&('lines:'+a.lines)].filter(Boolean);
const addName=k=>{const [a,b]=k.split(':');const n=(ADDS.find(x=>x[0]===a)||[0,a])[1];return a==='feel'?`感受·${b}`:a==='lines'?`${b} 行`:n;};

/* ---------- AI calls ---------- */
const SYS={modern:'你是一个写诗的 AI，正在给小学高年级学生演示“AI 怎样写诗”。按用户的要求写一首适合 10–12 岁孩子读的现代诗，内容积极健康。第一行写题目（用《》括起来），然后每行一句。只输出诗，不要分析和解释，不要使用 Markdown。',
 classic:'你是一个写诗的 AI，正在给小学高年级学生演示“AI 仿写古诗”。按用户的要求写一首古诗，内容健康。第一行写题目（用《》括起来），然后每句一行。只输出诗，不加注释和解释，不要使用 Markdown。'};
let ctls=new Set(),timers=new Set();
function stopAll(){ctls.forEach(c=>{try{c.abort();}catch(e){}});ctls.clear();timers.forEach(t=>clearInterval(t));timers.clear();Object.keys(S).forEach(k=>{if(k.startsWith('busy'))S[k]=false;});}
function fakeStream(text,onText,signal){return new Promise((res,rej)=>{const a=A(text);let i=0,tm=0;
 const ab=()=>{clearTimeout(tm);rej({code:'cancelled'});};if(signal){if(signal.aborted)return ab();signal.addEventListener('abort',ab,{once:true});}
 const step=()=>{i=Math.min(a.length,i+2+Math.floor(Math.random()*3));onText({text:a.slice(0,i).join('')});if(i>=a.length){if(signal)signal.removeEventListener('abort',ab);res();}else tm=setTimeout(step,45+Math.random()*40);};
 tm=setTimeout(step,450+Math.random()*450);});}
async function writePoem(prompt,{kind='modern',signal,onText,offline}){const t0=performance.now();let first=0;
 const ot=({text})=>{if(!first&&text)first=performance.now()-t0;if(onText)onText(text||'');};
 if(App.AI.real()){try{const r=await App.AI.chat(prompt,{system:SYS[kind],onText:ot,signal,tier:'default'});
   if(r&&r.text&&r.text.trim()){ot({text:r.text});return {text:clip(r.text,700),mode:r.mode||App.AI.mode(),ms:performance.now()-t0,first:first||performance.now()-t0};}}
  catch(e){App.AI.fail(e);if(e&&e.code==='cancelled')throw e;if(signal&&signal.aborted)throw {code:'cancelled'};App.toast(App.AI.errText(e));}}
 const txt=offline();const t1=performance.now();first=0;await fakeStream(txt,({text})=>{if(!first)first=performance.now()-t1;if(onText)onText(text);},signal);
 return {text:txt,mode:'offline',ms:performance.now()-t1,first,sim:1};}
function newCtl(){const c=new AbortController();ctls.add(c);return c;}
function timer(el){const t0=performance.now();const iv=setInterval(()=>{el.textContent=((performance.now()-t0)/1000).toFixed(1)+' s';},100);timers.add(iv);return ()=>{clearInterval(iv);timers.delete(iv);};}
const bump=()=>{const l=App.lesson(K);l.nExp=(l.nExp||0)+1;};
function poemHTML(t,{cur=false,hl=null}={}){const {title,lines}=poemLines(t);
 const ln=hl?lines.map(l=>hl(l)):lines.map(esc);return `${title?`<span class="tt">《${esc(title)}》</span>`:''}${ln.join('\n')}${cur?'<span class="cur"></span>':''}`;}
const clsHTML=(lines,hl)=>lines.map((l,i)=>(hl?hl(l):esc(l))+(i%2?'。':'，')).join('\n');

/* ---------- module state (memory only) ---------- */
const S={add:{det:0,pers:0,sim:0,feel:'',rhy:0,lines:0},cur:-1,blk:{imgs:['春风','桃花','燕子'],t:'p',rhy:0,feel:''},co:'春',coG:null,c:{imgs:new Set(['桃花','燕子']),pers:1,sim:0,det:1,rhy:0,feel:'温暖',lines:0},cmpRes:null,wp:'rain',src:null,ig:null};
/* small pieces shared by the stations */
const multi=(name,opts,on)=>`<span data-ms="${name}" style="display:contents">${opts.map(([v,t])=>`<button type="button" class="chip ${on(v)?'on':''}" data-v="${esc(v)}">${t}</button>`).join('')}</span>`;
const multiWire=(root,name,on,fn)=>{const box=$(`[data-ms="${name}"]`,root);if(!box)return;$$('.chip',box).forEach(b=>b.onclick=()=>{fn(b.dataset.v);$$('.chip',box).forEach(x=>x.classList.toggle('on',!!on(x.dataset.v)));});};
const secs=ms=>((ms||0)/1000).toFixed(1);
const CO4=['春','风','花','水'];
const W1=IMG.slice(0,6).map(m=>m.k),C6=IMG.slice(6).map(m=>m.k),BIMG=['春风','桃花','燕子','柳枝','春雨','小溪'];
const TN={p:'平铺直叙',n:'拟人',b:'比喻'};
const ADD6=[['det','具体画面'],['pers','拟人'],['sim','比喻'],['feel','温暖的感受'],['rhy','押韵'],['lines','写 8 行']];
const THS={'壮':'瀑布的壮丽','乡':'思念家乡','别':'朋友惜别'};
const KW6=['香炉峰','紫烟','瀑布','飞流直下','三千尺','银河'];
const VOTE=[['li','李白更强'],['eq','差不多'],['ai','AI 更强']],VT={li:[5,3],eq:[4,4],ai:[3,5]};
const HOW=['换掉了套话','加了亲眼见到的东西','写进了自己的感受','改了题目','调整了字句'];
const BQ=['感受过，所以写得出','没感受过，只是按规律组合词语','说不清'];
const CC=['具体版更接近','差不多','笼统版更接近'];

const CSS=`
.l7-col{display:flex;flex-direction:column;gap:14px;min-width:0}
.l7-poem{white-space:pre-line;font-size:16px;line-height:1.72}
.l7-poem .tt{display:block;font-weight:700;color:var(--grape-d)}
.l7-poem.cls{font-family:"Noto Serif SC","Songti SC",serif;font-size:21px;letter-spacing:.12em;text-align:center;line-height:2}
.l7-poem.cls.sm{font-size:18px;letter-spacing:.06em;line-height:1.9}
.l7-poem .cur::after{content:"▍";color:var(--grape);animation:l7b 1s steps(2) infinite}
@keyframes l7b{50%{opacity:0}}
.l7-big{font-family:var(--f-display);font-weight:800;font-size:26px;line-height:1.25;color:var(--ink)}
.l7-lab{font-weight:700}
.l7-card{border:1.5px solid var(--line2);border-radius:16px;padding:14px 16px;background:var(--paper);display:flex;flex-direction:column;gap:10px;min-width:0;align-self:start;width:100%}
.l7-card.l7-on{background:var(--sun-soft);box-shadow:0 6px 16px #6c47ff33}
.l7-card h4{margin:0;font-size:14px;color:var(--muted);display:flex;justify-content:space-between;gap:8px;align-items:center;flex-wrap:wrap}
.l7-tag{font-size:12.5px;font-weight:700;padding:1px 10px;border-radius:999px;background:var(--grape);color:#fff}
.l7-tag.cl{background:var(--mint-d)}
.l7-col>.l7-tag{align-self:center}
.l7-tag.dim{background:var(--panel2);color:var(--muted)}
.l7-prompt{font-size:17px;line-height:1.75;color:var(--ink)}
.l7-prompt mark{background:var(--sun);color:var(--ink);border-radius:6px;padding:0 3px}
.l7-chk{display:flex;flex-wrap:wrap;gap:6px}
.l7-chk span{font-size:13.5px;font-weight:700;padding:2px 10px;border-radius:999px}
.l7-chk span.ok{background:var(--mint-soft);color:var(--mint-d)}
.l7-chk span.no{background:var(--coral-soft);color:var(--coral-d)}
.l7-chk span.unk{background:var(--sun-soft);color:var(--sun-d)}
.l7-cl{border-bottom:2.5px solid var(--coral)}
.l7-judge{display:flex;flex-wrap:wrap;gap:8px;align-items:center;padding:10px 12px;border-radius:14px;background:var(--sun-soft);font-size:15.5px;font-weight:700;color:var(--ink)}
.l7-judge span{flex:1 1 220px;min-width:0}
.l7-rep{font-size:12.5px;font-weight:700;color:var(--coral-d);background:var(--coral-soft);border-radius:999px;padding:0 8px;margin-left:8px;white-space:nowrap}
.l7-vote{cursor:pointer;transition:transform .12s}
.l7-vote:hover{transform:translateY(-2px)}
.l7-ex b.p{background:var(--mint-soft);color:var(--mint-d)}
.l7-fcl{display:flex;flex-wrap:wrap;gap:6px;align-items:center;font-size:14px}
.l7-fcl em{font-style:normal;font-weight:700;font-size:13.5px;padding:1px 10px;border-radius:999px;background:var(--coral-soft);color:var(--coral-d)}
.l7-fcl em.ok{background:var(--mint-soft);color:var(--mint-d)}
.l7-tiles{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.l7-tiles em{font-style:normal;font-weight:700;font-size:18px;color:var(--ink);border:1.5px solid var(--line2);border-radius:12px;padding:8px 14px;box-shadow:0 6px 16px #6c47ff33}
.l7-tiles em.tp{background:#fff}
.l7-tiles em.res{background:var(--grape-soft);border-style:dashed;box-shadow:none}
.l7-tiles i{font-style:normal;font-family:var(--f-display);font-weight:800;font-size:22px;color:var(--muted)}
.l7-blk{display:flex;flex-direction:column;gap:4px;font-size:16px;line-height:1.7}
.l7-blk div{display:grid;grid-template-columns:58px minmax(0,1fr);gap:10px;align-items:center}
.l7-blk i{font-style:normal;font-size:12.5px;text-align:center;border-radius:6px;padding:0 4px;color:var(--ink);font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.l7-blk .tt{color:var(--grape-d);font-weight:700}
.l7-hl{background:var(--sun);border-radius:4px}
.l7-pair{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.l7-pair>*{min-width:0}
.l7-ex{font-size:17px;line-height:2}
.l7-ex b{background:var(--sun);border-radius:4px;padding:0 2px}
.l7-ex span.n{color:var(--muted);font-size:12.5px;margin-left:8px}
.l7-co{display:flex;flex-direction:column}
.l7-vrow{display:flex;justify-content:space-between;gap:8px;align-items:center;flex-wrap:wrap;font-size:15px;padding:4px 0;border-top:2px dashed var(--line)}
.l7-diff{white-space:pre-wrap;font-size:15.5px;line-height:1.85;word-break:break-all}
.l7-diff ins{text-decoration:none;background:var(--grape-soft);color:var(--grape-d);border-bottom:2px solid var(--grape)}
.l7-diff del{color:var(--coral-d)}
.l7-meter{position:relative;height:14px;border-radius:999px;background:var(--panel2);border:1.5px solid var(--line2);overflow:hidden}
.l7-meter i{display:block;height:100%;background:var(--mint);transition:width .3s}
.l7-meter::after{content:"";position:absolute;left:30%;top:0;bottom:0;border-left:2.5px dashed var(--ink)}
.l7-sug{margin:0;padding-left:20px;font-size:15.5px;display:flex;flex-direction:column;gap:4px}
.l7-dex{display:flex;flex-direction:column;gap:12px;font-size:14px}
.l7-dex .l7-poem{font-size:15px}
#l7-ftext{min-height:270px;font-size:16px;line-height:1.8}
#l7-bsin{width:120px;flex:none}
@media (max-width:560px){.l7-pair{grid-template-columns:1fr}.l7-poem.cls{font-size:18px;letter-spacing:.06em}.l7-blk div{grid-template-columns:50px minmax(0,1fr)}.l7-tiles em{font-size:16px;padding:6px 10px}}`;

/* ---------- quiz ---------- */
const QUIZ=[
 {id:'q1',q:'AI 写诗的过程，最像下面哪一种？',opts:['拼积木：从学过的字词组合规律里，挑出和主题相关的部分，组合成诗','像诗人一样，亲自去看风景，有了感受再写','从网上找一首现成的诗，原样抄下来','把字随便排在一起，碰运气'],a:0,why:'AI 学过成千上万首诗，记住了字、词、短语的组合规律；给它一个主题，它就挑出相关的“积木”，按诗的格式拼起来。'},
 {id:'q2',q:'想让 AI 写的春天诗更符合你的想法，哪个提示词最好？',opts:['写一首诗','写一首关于春天的诗','写一首关于春天的现代诗，用拟人手法写桃花在阳光下绽放，表达温暖的感受','写一首全世界最好的诗'],a:2,why:'具体的意象（桃花、阳光）、修辞手法（拟人）和想表达的感受（温暖），都能让 AI 更明白你要什么。'},
 {id:'q3',q:'下面哪一项是 AI 写诗的优点？',opts:['能写出诗人亲身经历的真情实感','速度快，格式和押韵通常正确，词汇丰富','写出来的诗一定比人写得好','不需要任何提示词也能写出你想要的诗'],a:1,why:'AI 反应迅速、掌握大量写作方法，几秒钟就能拼出格式正确的诗句；但真情实感和独特的想象，它很难给。'},
 {id:'q4',q:'AI 仿写李白，字数、押韵都对，却很难写出“飞流直下三千尺，疑是银河落九天”那样的震撼。主要原因是：',opts:['AI 学过的诗太少','AI 没有亲身体验和内心触动，只是根据学过的内容排列组合词语','提示词写得太长了','电脑屏幕太小，显示不出气势'],a:1,why:'李白的创作源于他亲眼所见和内心的触动；AI 无法感受庐山瀑布的震撼，只能模仿和组合学过的内容。'},
 {id:'q5',q:'小林要参加学校的诗歌比赛。下面哪种做法最恰当？',opts:['让 AI 写一首，直接交上去','请 AI 提供一些描写春天的词语和修辞建议，自己写诗，并说明哪些地方得到了 AI 的帮助','把 AI 写的诗改几个字，说是自己写的','比赛前不能看任何书和资料'],a:1,why:'AI 可以帮我们激发灵感、提供素材、润色语言；核心的创意和真情实感要自己来写，用了 AI 帮助要如实说明。'}];

/* ---------- render ---------- */
L.render=function(){const v=$('#v-'+K);if(!document.getElementById('css-l7')){const st=document.createElement('style');st.id='css-l7';st.textContent=CSS;document.head.appendChild(st);}
 const col=h=>`<div class="l7-col">${h}</div>`;
 v.innerHTML=`${App.hero(K,'今天你是诗词工坊的研究员：看 AI 写诗多快、多工整，再和诗人比一比。',['学会用 AI 创作诗歌。','知道用 AI 生成文字的优点和不足。'])}

 <div class="station" id="l7-s0">${App.head('WARM-UP','导入 · 原理','字的好搭档','猜猜古诗里，哪个字最爱和它做邻居')}
  <ol class="steps"><li>猜一个好搭档</li><li>查够 2 个字</li></ol>
  <div class="grid2"><div class="l7-card" id="l7-costage"></div>
   ${col(`${App.knobs([['查哪个字',App.seg('co',CO4.map(c=>[c,c]),'春')]])}
    <div class="go-row"><span class="l7-lab">我猜是</span><span id="l7-coguess" style="display:contents"></span>${App.go('l7-cogo','数一数')}</div>
    ${App.aiBox('l7-coout','先猜一个，再按「数一数」','小诗库的统计')}<div id="l7-cofb"></div>`)}</div>
  <details class="more"><summary>说明</summary><p class="note">小诗库共 ${NLINES} 句。真正的大模型学过成千上万首诗，这里只用一个小诗库演示“组合规律”是怎么数出来的。教材插图里，AI 写了“春风拂面暖，花开满庭芳。小鸟枝头唱，万物展新妆”。</p>${App.know('像拼积木一样写诗','AI 知识广博、反应迅速，掌握了大量诗歌的写作方法。只需要给它几个关键词，它就能快速组合出格式正确的诗句——这个过程就像拼积木，AI 知道哪些字、词、短语适合拼在一起。小诗库里，“春”常和“风”“花”“江”在一起，这就是一种“组合规律”。')}</details>
 </div>

 <div class="station" id="l7-s0b">${App.head('PRINCIPLE','导入 · 原理','拼一首积木诗','挑几块积木，看生成器怎样拼出一首诗')}
  <ol class="steps"><li>选积木，拼一首</li><li>回答一个问题</li></ol>
  <div class="grid2"><div class="l7-card" id="l7-bstage"></div>
   ${col(`${App.knobs([['意象积木',multi('bi',BIMG.map(k=>[k,k]),k=>S.blk.imgs.includes(k)),'最多 3 块'],['句式',App.seg('bt',[['p','平铺直叙'],['n','拟人'],['b','比喻']],S.blk.t)],['韵脚',App.seg('br',[['0','不要求'],['1','句尾押韵']],S.blk.rhy),'句尾读音像：光、香']])}
    <div class="go-row">${App.go('l7-bgo','拼一首')}</div>
    ${App.aiBox('l7-bout','积木诗会出现在这里','积木生成器')}<div id="l7-bfb"></div>
    <div class="after-run">${App.pad('生成器感受过春风吹在脸上的温暖吗？',`<div class="opts" id="l7-bq"></div>`)}</div>`)}</div>
  <details class="more"><summary>说明</summary><p class="note">每行诗前面的色块，标出这一行用的是哪块积木。离线时，工坊里的“AI”就是这台积木生成器。</p>${App.know('积木生成器和大模型','这台示意版生成器只有 12 块意象积木和几十个句子模板，所以诗句会重复。大模型学过的“积木”多得多，还能根据上下文灵活变化，写出的诗更通顺、更多样——但原理相通：按学到的规律挑选、组合，而不是亲身去感受春天。')}</details>
 </div>

 <div class="station" id="l7-s1">${App.head('EXP-01','挑战一 · 作诗初体验','诗词工坊','让 AI 写春天的诗，再加要求写到第 3 版')}
  <ol class="steps"><li>让 AI 写一首</li><li>加要求写到第 3 版</li></ol>
  <div class="grid2">${col(`<div class="l7-card"><h4><span>发给 AI 的提示词</span><span class="l7-tag dim">黄底是加的要求</span></h4><div class="l7-prompt" id="l7-full"></div></div>`)}
   ${col(`${App.knobs([['写什么',multi('bs',W1.map(k=>[k,k]),()=>false)],['自己加',`<input type="text" id="l7-bsin" maxlength="6" placeholder="如 油菜花" aria-label="自己加一样春天的事物"><span id="l7-bsc" style="display:contents"></span>`,'写完按回车'],['加要求',multi('add',ADD6,()=>false),'一次加一条']])}
    <div class="go-row">${App.go('l7-go1','让 AI 写诗')}</div>
    ${App.aiBox('l7-out1','按下大按钮，诗会写在这里')}<div id="l7-fb1"></div>
    <div class="after-run">${App.pad('',`<div id="l7-o1" class="l7-col"></div>`,'观察任务')}</div>`)}</div>
  <details class="more"><summary>说明</summary><p class="note">每一版都自动计时、自动检查要求有没有写到（按关键词近似判断）。离线时，诗由平台内置的示意版「积木」生成器给出，用时为模拟；接入大模型后会真实生成，每次结果都可能不同。</p>${App.think(['你认为用 AI 创作诗歌有哪些优势？','如果希望 AI 创作出更符合你想法的诗，可以怎么做？','AI 的文本生成功能在生活中有哪些应用？'])}${App.know('提示词越具体，诗越贴切','如果想让 AI 创作的诗歌更符合你的想法，可以给它提供更具体的提示词，如“在诗中体现温暖的春风拂过脸颊”“用拟人手法，描述桃花在阳光下绽放”。AI 的文本生成功能对文字表达、创意激发有一定的辅助作用，不仅可以用于写诗，还可以协助我们创作其他形式的作品。')}</details>
 </div>

 <div class="station" id="l7-s2">${App.head('EXP-02','挑战一 · 延伸','提示词对比器','笼统对具体：让具体版命中全部要求')}
  <ol class="steps"><li>两版一起写</li><li>选出更像的一版</li></ol>
  <div class="grid2">${col(`<div class="l7-card"><h4><span>笼统版提示词</span></h4><div class="l7-prompt">写一首关于春天的诗。</div></div>
    <div class="l7-card l7-on"><h4><span>具体版提示词</span><span class="l7-tag dim">跟着右边变</span></h4><div class="l7-prompt" id="l7-cp"></div></div>`)}
   ${col(`${App.knobs([['意象',multi('ci',C6.map(k=>[k,k]),k=>S.c.imgs.has(k)),'写进诗的景物，选 2–4 个'],['手法',multi('ct',[['pers','拟人'],['sim','比喻'],['det','具体画面'],['rhy','押韵']],k=>!!S.c[k])],['感受',App.seg('cf',[['','不指定'],['温暖','温暖'],['快乐','快乐'],['希望','希望'],['惊喜','惊喜']],S.c.feel)]])}
    <div class="go-row">${App.go('l7-cgo','两版一起写')}</div>`)}</div>
  ${App.aiBox('l7-cout','两首诗会并排出现在这里','AI 写的两版')}<div id="l7-cfb"></div>
  <div class="after-run">${App.pad('哪一版更接近你心里想要的春天？',`<div class="opts" id="l7-cc"></div>`)}</div>
  <details class="more"><summary>说明</summary><p class="note">检查方法：在诗里查找意象的名称、拟人和比喻的标志词、颜色声音气味的字和韵脚（按关键词近似判断，最后还要你自己读一读）。套话指“真美”“到处”“美丽”这类最常见的词。</p>${App.know('为什么笼统的提示词容易得到“套话”','只给主题时，AI 会挑它学过的、和“春天”一起出现得最多的词语——花开了、草绿了、春天真美——这些最常见的组合读者早已读过很多遍。提示词给出具体的意象、手法和感受，就等于告诉 AI 该挑哪几块积木，诗才更贴近你的想法。')}</details>
 </div>

 <div class="station" id="l7-s3">${App.head('EXP-03','挑战二 · 仿写挑战赛','AI 仿写李白','让 AI 学李白写瀑布，猜它字数押韵对不对')}
  <ol class="steps"><li>选主题和关键词</li><li>先猜，再揭晓</li></ol>
  <div class="grid2"><div class="l7-card"><h4><span>望庐山瀑布</span><span class="l7-tag cl">唐 · 李白</span></h4><div class="l7-poem cls" id="l7-libai">${clsHTML(LIBAI)}</div></div>
   ${col(`${App.knobs([['主题',App.seg('ith',TH.map(t=>[t[0],THS[t[0]]]),''),'这首诗写什么'],['关键词',multi('ikw',KW6.map(w=>[w,w]),()=>false),'诗里的词'],['意境',multi('imd',MD.map(m=>[m[0],m[0]]),()=>false),'读起来的感觉']],'读原诗，提炼提示词')}
    <div class="go-row"><span class="l7-lab">我猜它</span>${App.seg('ig',[['1','全对'],['0','会出错']],'')}${App.go('l7-igo','让 AI 仿写')}</div>
    ${App.aiBox('l7-iout','先猜一猜，再让 AI 仿写')}<div id="l7-ifb"></div>
    <div class="after-run">${App.pad('AI 写的古诗有什么特点？（可多选）',`<div class="opts" id="l7-if"></div>`)}</div>`)}</div>
  <details class="more"><summary>说明</summary><p class="note">诵读李白的《望庐山瀑布》，和同学讨论这首诗的主题、关键内容和意境，提炼成提示词，让 AI 模仿李白的风格写一首古诗。检查器只能数句数、字数；押韵按普通话读音粗略判断（不检查平仄），拿不准时请你读一读、自己判。“全对”只说明形式像，好不好还要你读。</p></details>
 </div>

 <div class="station" id="l7-s3b">${App.head('EXP-03b','挑战二 · 仿写挑战赛','李白对 AI','你当评委：两首诗比三项，各投一票')}
  <ol class="steps"><li>三项各投一票</li><li>写下差在哪里</li></ol>
  <div class="grid2"><div class="l7-col" id="l7-duel"></div>
   ${col(`${App.knobs(RD.map(([d,n])=>[n,App.seg('r'+d,VOTE,'')]),'我当评委')}
    <div id="l7-rfb"></div>
    <div class="after-run">${App.pad('差在哪里？结合诗句说一说',`<textarea id="l7-iwhy" maxlength="400" placeholder="李白写……，AI 写……" aria-label="差在哪里"></textarea>`)}</div>`)}</div>
  <details class="more"><summary>说明</summary>${App.think(['AI 能模仿诗人的风格，但它能真正理解诗人写诗时的心情和感受吗？','AI 创作的诗在体裁、用词上可能都符合要求，但它是否能真正打动我们？为什么？'])}${App.know('合辙押韵，却少了震撼','AI 了解常见的古诗格律，能模仿李白的诗歌风格，却很难理解和再现李白诗中那种豪迈奔放的情感、天马行空的想象力——“飞流直下三千尺，疑是银河落九天”所带给人的震撼。李白的创作源于他亲身的体验和内心的触动；而 AI 只是基于学过的内容排列组合词语，它无法感受庐山瀑布的震撼，因而难以写出传世经典。')}</details>
 </div>

 <div class="station" id="l7-s4">${App.head('EXP-04','活动 · 人机对决','人机对决墙','点更打动你的那首诗，再揭晓谁是 AI')}
  <ol class="steps"><li>投票，再揭晓</li><li>集齐 3 组</li></ol>
  <div class="grid2"><div class="l7-col" id="l7-wall"></div>
   ${col(`${App.knobs([['第几组',App.seg('wp',WALL.map((p,i)=>[p.id,`${i+1} ${p.n}`]),S.wp)]])}
    <div class="go-row"><span class="l7-lab">更打动我的是</span>${App.seg('wv',[['0','甲'],['1','乙']],'')}${App.go('l7-wrev','揭晓作者')}</div>
    ${App.aiBox('l7-wout','点左边的一首诗投票，再按「揭晓作者」','揭晓')}<div id="l7-wfb"></div>
    <div class="after-run">${App.pad('它打动我的地方（可多选）',`<div class="opts" id="l7-wr"></div>`)}</div>`)}</div>
  <details class="more"><summary>说明</summary><p class="note">每组两首诗：一首是流传千年的经典，一首是 AI 仿写的同题诗（平台预置示例），作者先隐藏、顺序随机。</p></details>
 </div>

 <div class="station" id="l7-s4b">${App.head('TALK','活动 · 人机对决','AI 的诗能打动人吗','看看自己的投票，亮出你的看法')}
  <ol class="steps"><li>选一个看法</li><li>写一句理由</li></ol>
  <div class="grid2"><div class="l7-card" id="l7-talk"></div>
   ${col(`${App.knobs([['我觉得',App.seg('ws',STANCE,'')]],'我的看法')}
    <div id="l7-tfb"></div>
    <div class="after-run">${App.pad('为什么？写一句理由',`<textarea id="l7-wsw" maxlength="400" placeholder="我在第__组选了__，因为……" aria-label="我的理由"></textarea>`)}</div>`)}</div>
  <details class="more"><summary>说明</summary>${App.know('打动人的是什么','文学作品中真正打动人心的，往往不是整齐的格式与优美的词汇，而是其中独特的视角与真实的感受。AI 创作的诗只是对所学内容的模仿与组合，缺少真实情感。“相看两不厌，只有敬亭山”里的孤独，“野渡无人舟自横”里的安静，都来自诗人自己的经历。')}</details>
 </div>

 <div class="station" id="l7-s5">${App.head('EXP-05','实践 · 人机协作','改写定稿','把 AI 的初稿改成你的诗，自己写的字超过 30%')}
  <ol class="steps"><li>动手改一改</li><li>保存定稿</li></ol>
  <div class="grid2">${col(`<label class="f" for="l7-ftext"><span>我的诗 · 现在是 <b id="l7-fbase">AI 初稿</b>，直接在里面改</span><textarea id="l7-ftext" rows="10" maxlength="600"></textarea></label>
    <div class="l7-fcl" id="l7-fcl"></div>
    <div class="row"><span class="l7-lab">自己写的字</span><span class="l7-big" id="l7-fpct">0%</span><span class="note">过了虚线（30%）就达标</span></div><div class="l7-meter"><i id="l7-fmeter" style="width:0"></i></div>`)}
   ${col(`${App.knobs([['AI 初稿',`<span id="l7-fsrc" style="display:contents"></span>`]])}
    <div class="go-row"><button class="btn ghost sm" type="button" id="l7-fsug">问问 AI 参谋</button><button class="btn ghost sm" type="button" id="l7-freset">从初稿重来</button>${App.go('l7-fsave','保存定稿')}</div>
    ${App.aiBox('l7-fsugout','卡住了？问问 AI 参谋：它只提建议，不替你写','AI 参谋')}<div id="l7-ffb"></div>
    <div class="after-run">${App.pad('我改了什么？（可多选）',`<div class="l7-diff" id="l7-fdiff"></div><div class="opts" id="l7-fhow"></div><label class="row"><input type="checkbox" id="l7-flabelck"> 给作品附上「AI 参与说明」</label><p class="note" id="l7-flabel"></p>`)}</div>`)}</div>
  <details class="more"><summary>说明</summary><p class="note">换掉套话，加进你真的见过、感受过的东西。平台会逐字比较，算出你改了多少（紫色是你新写的字，红色删除线是删掉的 AI 原文）。离线时，AI 参谋按规则检查初稿：套话、重复、长句、有没有“我”。</p>${App.know('AI 是辅助，人是作者','AI 可以帮助我们润色语言、拓展思路、提供素材，但作品中独属于人类的创造力、想象力和真情实感，难以被 AI 替代。真正打动人心的文学作品，来源于作者对生活的细致观察、对情感的深刻体验，以及对世界的独特理解。用了 AI 的帮助，要如实说明。')}</details>
 </div>

 <div class="station" id="l7-quiz-st">${App.head('QUIZ','检测','小测验','5 道题，第一次作答计入能力图谱')}<div id="l7-quiz"></div></div>
 <div class="station" id="l7-diary"></div>`;
 if(!App.rec)return;wire();};

function wire(){const lr=App.lesson(K);
 ['bs','bsC','vers'].forEach(k=>{if(!Array.isArray(lr[k]))lr[k]=[];});['blk','o1','t1','im','wall','fin'].forEach(k=>{if(!lr[k]||typeof lr[k]!=='object')lr[k]={};});
 const tx=(id,obj,key,after)=>{const el=$(id);el.value=obj[key]||'';let t;el.addEventListener('input',()=>{obj[key]=clip(el.value,400);clearTimeout(t);t=setTimeout(()=>{App.touch();if(after)after();},600);});};
 const chips=(sel,opts,on,fn)=>{const root=$(sel);const draw=()=>{root.innerHTML=opts.map((t,j)=>`<button type="button" class="chip ${on(j)?'on':''}" data-j="${j}">${t}</button>`).join('');$$('.chip',root).forEach(b=>b.onclick=()=>{fn(+b.dataset.j);draw();});};draw();return draw;};
 const tog=(a,i)=>{a.includes(i)?a.splice(a.indexOf(i),1):a.push(i);};

 /* ===== WARM-UP 字的好搭档：先猜后数 ===== */
 const s0=$('#l7-s0');const B=lr.blk;B.co=B.co||[];
 const both=(a,b)=>CORPUS.reduce((s,p)=>s+p[3].filter(l=>l.includes(a)&&l.includes(b)).length,0);
 const coCand=ch=>{const top=coOf(ch).top[0][0];const ds=A('雪船山夜门寺月鸟').filter(c=>c!==ch&&both(ch,c)===0).slice(0,2);const h=hash(ch);
  return [top,...ds].map((c,i)=>[c,(h>>>(i*3))%7]).sort((x,y)=>x[1]-y[1]||(x[0]<y[0]?-1:1)).map(x=>x[0]);};
 /* partner = the counted top partner: after counting, the stage switches to the lines where the two characters really sit together */
 const drawCo=partner=>{const r=coOf(S.co);let ex=r.ex;
  if(partner){ex=[];CORPUS.forEach(([t,a,d,ls])=>ls.forEach(l=>{if(ex.length<4&&l.includes(S.co)&&l.includes(partner))ex.push([l,t,a,d]);}));}
  $('#l7-costage').innerHTML=`<h4><span>小诗库 · ${CORPUS.length} 首春天古诗</span><span class="l7-tag cl">${partner?`「${S.co}」和「${partner}」在一起的句子`:`含「${S.co}」的有 ${r.n} 句`}</span></h4><div class="l7-ex">${ex.map(([l,t,a])=>`<div>${A(l).map(c=>c===S.co?`<b>${c}</b>`:c===partner?`<b class="p">${c}</b>`:esc(c)).join('')}<span class="n">${esc(a)}《${esc(t)}》</span></div>`).join('')}</div>`;
  $('#l7-coguess').innerHTML=coCand(S.co).map(c=>`<button type="button" class="chip ${S.coG===c?'on':''}" data-cg="${c}">${c}</button>`).join('');
  $$('[data-cg]',s0).forEach(b=>b.onclick=()=>{S.coG=b.dataset.cg;$$('[data-cg]',s0).forEach(x=>x.classList.toggle('on',x===b));});};
 const marks0=()=>{if(B.g&&B.g.n)App.markStep(s0,0);if(B.co.length>=2)App.markStep(s0,1);};
 App.segWire(s0,'co',v=>{S.co=v;S.coG=null;drawCo();$('#l7-cofb').innerHTML='';App.aiSay('#l7-coout','先猜一个，再按「数一数」',{mood:'idle'});$('#l7-coout').classList.add('wait');});
 $('#l7-cogo').onclick=()=>{const ch=S.co,r=coOf(ch),mx=r.top[0][1],top=r.top[0][0],g=S.coG;const seen=B.co.includes(ch);if(!seen){B.co.push(ch);if(B.co.length>8)B.co.shift();}
  /* a guess only counts the first time a character is counted: afterwards the answer is already on the screen */
  const gn=g?((r.top.find(x=>x[0]===g)||[0,0])[1]):0,hit=!!g&&gn===mx;if(g&&!seen){B.g=B.g||{n:0,ok:0};B.g.n++;if(hit)B.g.ok++;}
  drawCo(hit?g:top);
  App.aiSay('#l7-coout',`<div class="big">「${ch}」的头号搭档是「${hit?g:top}」</div><div class="l7-co">${r.top.slice(0,5).map(([c,n])=>`<div class="hbar"><span>${esc(c)}</span><span class="tr"><i style="width:${100*n/mx}%;background:var(--grape)"></i></span><span>${n} 次</span></div>`).join('')}</div>${r.bi.length?`<p class="note">常见搭配：${r.bi.slice(0,4).map(([w,n])=>`${esc(w)} ×${n}`).join('　')}</p>`:''}`,{mood:hit?'happy':'think'});
  const st=B.co.length>=2?(B.g&&B.g.ok?3:2):1,more=B.co.length<2?'再查一个字。':'';const left=CO4.filter(c=>!B.co.includes(c));
  if(seen)App.fb('#l7-cofb','find',`「${ch}」查过了，答案还是「${top}」`,left.length?`换成「${left[0]}」，先猜再数，这次才算数。`:'四个字都查过了，去下一站拼一首积木诗。',{stars:st});
  else if(!g)App.fb('#l7-cofb','find',`数出来了：同句 ${mx} 次`,`看左边：绿底的「${top}」常和「${ch}」挨在一起，这就是“组合规律”。换个字，先猜再数。`,{stars:Math.min(st,2)});
  else if(hit)App.fb('#l7-cofb','ok',`猜对了！「${ch}」常和「${g}」在一起`,`看左边绿底的字。AI 就是这样数出规律的，它可没被春风吹过。${more}`,{stars:st});
  else App.fb('#l7-cofb','try',`没猜中，头号搭档是「${top}」`,`「${g}」和「${ch}」在小诗库里同句 ${gn} 次，「${top}」有 ${mx} 次。换个字再猜。`,{stars:st});
  App.touch();marks0();$('#l7-cogo').classList.add('again');};
 drawCo();marks0();

 /* ===== PRINCIPLE 拼一首积木诗 ===== */
 const s0b=$('#l7-s0b');
 const drawBstage=()=>{const a=S.blk.imgs;$('#l7-bstage').innerHTML=`<h4><span>积木台</span><span class="l7-tag dim">示意版生成器</span></h4>
   <div class="l7-tiles">${a.length?a.map((k,i)=>`<em style="background:${COLS[i%COLS.length]}">${k}</em>`).join('<i>+</i>'):'<span class="note">没选积木：只能拼套话</span>'}</div>
   <div class="l7-tiles"><i>×</i><em class="tp">${TN[S.blk.t]}句式</em>${S.blk.rhy?'<i>+</i><em class="tp">句尾押韵</em>':''}<i>=</i><em class="res">一首诗</em></div>`;};
 multiWire(s0b,'bi',k=>S.blk.imgs.includes(k),k=>{const a=S.blk.imgs;if(a.includes(k))a.splice(a.indexOf(k),1);else{if(a.length>=3){App.toast(`最多 3 块：「${a[0]}」换成了「${k}」`);a.shift();}a.push(k);}drawBstage();});
 App.segWire(s0b,'bt',v=>{S.blk.t=v;drawBstage();});App.segWire(s0b,'br',v=>{S.blk.rhy=+v;drawBstage();});
 const blkPrompt=()=>`请围绕“春天”写一首现代诗。${S.blk.imgs.length?'写到：'+S.blk.imgs.join('、')+'。':''}${S.blk.t==='n'?'用拟人的手法。':S.blk.t==='b'?'用比喻的手法。':''}${S.blk.rhy?'押韵。':''}`;
 const marks0b=()=>{if(B.n)App.markStep(s0b,0);if(B.q)App.markStep(s0b,1);};
 const bStars=()=>B.q&&B.q.last===1?3:(B.n||0)>=2?2:1;
 /* S.bSeen = every line this student has already been shown in this visit, so the banner can say what really repeated */
 S.bSeen=S.bSeen||new Set();
 $('#l7-bgo').onclick=()=>{B.n=(B.n||0)+1;const first=!S.bSeen.size;const res=compose(blkPrompt(),[],B.n*7919);const {lines,title}=poemLines(res.text);const tags=[...new Set(res.bl)];
  const colOf=t=>S.blk.imgs.includes(t)?COLS[S.blk.imgs.indexOf(t)%COLS.length]:IMGM[t]?COLS[tags.indexOf(t)%COLS.length]:'var(--line)';
  const rep=lines.map(l=>S.bSeen.has(l)),nRep=rep.filter(Boolean).length;lines.forEach(l=>S.bSeen.add(l));
  const endHl=l=>{if(!S.blk.rhy)return esc(l);const a=A(l);for(let i=a.length-1;i>=0;i--)if(HZ.test(a[i])){if(rg(a[i])!=='ang')break;return esc(a.slice(0,i).join(''))+`<span class="l7-hl">${a[i]}</span>`+esc(a.slice(i+1).join(''));}return esc(l);};
  App.aiSay('#l7-bout',`<div class="l7-blk"><span class="tt">《${esc(title)}》</span>${lines.map((l,i)=>`<div><i style="background:${colOf(res.bl[i])}">${esc(res.bl[i]||'')}</i><span>${endHl(l)}${rep[i]?'<small class="l7-rep">刚才出现过</small>':''}</span></div>`).join('')}</div>${S.blk.rhy?'<p class="note"><span class="l7-hl">黄底</span>的句尾读起来相近，这就是押韵。</p>':''}`,{mood:'happy',src:'offline'});
  if(first)App.fb('#l7-bfb','find',`拼好了：${lines.length} 行诗`,'什么都不改，再按一次「拼一首」：猜猜会有几行一模一样？',{stars:bStars()});
  else if(nRep*2>=lines.length)App.fb('#l7-bfb','find',`${lines.length} 行里有 ${nRep} 行刚才出现过`,'它只是在挑积木、套模板，所以会重复。回答下面的问题。',{stars:bStars()});
  else if(nRep)App.fb('#l7-bfb','find',`换了设置，还有 ${nRep} 行刚才出现过`,'积木和句式一换，句子就跟着换；没换的那块，句子一字不差。回答下面的问题。',{stars:bStars()});
  else App.fb('#l7-bfb','find','这次句子全换了','因为你换了积木或句式。什么都不改再拼一次，看会不会重复。回答下面的问题。',{stars:bStars()});
  App.touch();marks0b();$('#l7-bgo').classList.add('again');};
 chips('#l7-bq',BQ,j=>B.q&&B.q.last===j,j=>{if(!B.q)B.q={first:j};B.q.last=j;App.touch();marks0b();
  if(j===1)App.fb('#l7-bfb','ok','说对了！','它只是把常一起出现的词拼在一起，从没被春风吹过。',{stars:3});
  else App.fb('#l7-bfb','try','再想想','生成器只有词句库和模板。它出过门、吹过风吗？',{stars:bStars()});});
 drawBstage();marks0b();if(B.n)App.ran(s0b);

 /* ===== EXP-01 诗词工坊 ===== */
 const s1=$('#l7-s1');const O1=lr.o1,T1=lr.t1;T1.apps=T1.apps||[];
 if(!lr.bs.length&&!lr.bsC.length&&!lr.vers.length)lr.bs=['阳光','小草','小鸟'];
 const words=()=>[...lr.bs.map(k=>(IMGM[k]||{}).w||k),...lr.bsC];
 const autoP=()=>`请围绕“春天”这一主题，写一首现代诗。${words().length?'诗里要写到：'+words().join('、')+'。':''}`;
 const fullP=()=>(autoP()+addSentence(S.add)).slice(0,500);
 const drawFull=()=>{const a=addSentence(S.add);$('#l7-full').innerHTML=esc(autoP())+(a?`<mark>${esc(a)}</mark>`:'');lr.p1=autoP();};
 const drawCus=()=>{$('#l7-bsc').innerHTML=lr.bsC.map((w,i)=>`<button type="button" class="chip sel" data-bc="${i}" title="点一下移除">${esc(w)} ×</button>`).join('');
  $$('[data-bc]',s1).forEach(b=>b.onclick=()=>{lr.bsC.splice(+b.dataset.bc,1);drawCus();drawFull();App.touch();});};
 multiWire(s1,'bs',k=>lr.bs.includes(k),k=>{if(lr.bs.includes(k))lr.bs.splice(lr.bs.indexOf(k),1);else if(lr.bs.length+lr.bsC.length<6)lr.bs.push(k);else App.toast('最多选 6 样');drawFull();App.touch();});
 $$('[data-ms="bs"] .chip',s1).forEach(x=>x.classList.toggle('on',lr.bs.includes(x.dataset.v)));
 const addCus=()=>{const el=$('#l7-bsin');const w=el.value.trim().replace(/[，。,.、\s]/g,'').slice(0,6);if(!w)return;if(!HZ.test(w)){App.toast('写一个中文词语');return;}
  el.value='';if(lr.bsC.includes(w)||lr.bs.includes(w))return;if(lr.bsC.length>=2){App.toast('最多自己加 2 样');return;}lr.bsC.push(w);drawCus();drawFull();App.touch();};
 $('#l7-bsin').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();addCus();}});$('#l7-bsin').addEventListener('change',addCus);
 multiWire(s1,'add',k=>!!S.add[k],k=>{const a=S.add;if(k==='feel')a.feel=a.feel?'':'温暖';else if(k==='lines')a.lines=a.lines?0:8;else a[k]=a[k]?0:1;drawFull();});
 $$('[data-ms="add"] .chip',s1).forEach(x=>x.classList.toggle('on',!!S.add[x.dataset.v]));
 const vNo=i=>(lr.vN||lr.vers.length)-lr.vers.length+i+1;
 const rowsOf=v=>judged(check(v.t,parseP(v.p,lr.bsC)),v.ov);
 const showV=i=>{const v=lr.vers[i];if(!v)return;S.cur=i;const rows=rowsOf(v),n=lr.vers.length,unk=rows.find(r=>r.st==='unk');
  const vers=n>1?`<div class="row"><span class="note">翻看：</span>${lr.vers.map((x,j)=>j<n-4?'':`<button type="button" class="chip ${j===i?'on':''}" data-ver="${j}">第 ${vNo(j)} 版</button>`).join('')}</div>`:'';
  App.aiSay('#l7-out1',`<div class="big">第 ${vNo(i)} 版 · ${secs(v.ms)} 秒写完</div>${vers}<div class="l7-poem">${poemHTML(v.t,{hl:marker(rows)})}</div>${rows.length?chkHTML(rows):''}
   ${anyMark(rows)?'<p class="note"><span class="l7-hl">黄底</span>是检查器在诗里找到的“加的要求”。</p>':''}
   ${unk?`<div class="l7-judge"><span>检查器只认关键词，没查到「${esc(unk.l)}」。你读一读：AI 写到了吗？</span><button type="button" class="chip" data-jg="1">写到了</button><button type="button" class="chip" data-jg="0">真的漏了</button></div>`:''}`,
   {mood:rows.some(r=>r.st==='no')?'oops':unk?'think':'happy',src:v.m||'offline'});
  $$('#l7-out1 [data-ver]').forEach(b=>b.onclick=()=>showV(+b.dataset.ver));
  $$('#l7-out1 [data-jg]').forEach(b=>b.onclick=()=>{const yes=b.dataset.jg==='1';v.ov=v.ov||{};v.ov[unk.l]=yes?1:0;const r2=rowsOf(v);v.hit=r2.filter(x=>x.ok).length;App.touch();showV(i);
   const n2=lr.vN||n,left=r2.filter(x=>x.st==='unk').length,all=r2.every(x=>x.ok);
   if(!yes)App.fb('#l7-fb1','oops','你发现 AI 的错误了！',`「${esc(unk.l)}」真的没写到。AI 也会漏掉要求，再写一版试试。`,{stars:n2>=2?2:1});
   else if(left)App.fb('#l7-fb1','find','你比检查器看得准',`还有 ${left} 项没查到，接着判。`,{stars:n2>=2?2:1});
   else if(all&&n2>=3)App.fb('#l7-fb1','ok',`第 ${vNo(i)} 版，${r2.length} 项要求全中！`,'有一项是靠你读出来的：检查器只认关键词，好不好还得人来读。',{stars:3});
   else App.fb('#l7-fb1','find','你比检查器看得准',all?'这一版的要求都写到了。再加一条要求，写到第 3 版。':'再写一版试试。',{stars:n2>=2?2:1});});};
 const drawVers=()=>{};
 const marks1=()=>{if(lr.vers.length)App.markStep(s1,0);if((lr.vN||0)>=3)App.markStep(s1,1);};
 $('#l7-go1').onclick=async()=>{if(S.busy1)return;const b=$('#l7-go1');const full=fullP(),keys=addKeys(S.add),prev=lr.vers[lr.vers.length-1];
  S.busy1=true;App.busy(b,true,'AI 正在写…');App.aiSay('#l7-out1','正在挑选词语、组合诗句……',{busy:true});const ctl=newCtl();
  try{const r=await writePoem(full,{kind:'modern',signal:ctl.signal,onText:t=>App.aiSay('#l7-out1',`<div class="l7-poem">${poemHTML(t,{cur:true})}</div>`,{busy:true}),offline:()=>compose(full,lr.bsC,hash(App.rec.id)+(lr.vN||0)*131).text});
   const rows=judged(check(r.text,parseP(full,lr.bsC))),hit=rows.filter(x=>x.ok).length,miss=rows.filter(x=>x.st==='no'),unk=rows.filter(x=>x.st==='unk').map(x=>x.l);
   lr.vers.push({p:clip(full,500),a:keys,t:clip(r.text,700),m:r.mode,ms:Math.round(r.ms),f:Math.round(r.first),req:rows.length,hit});
   if(lr.vers.length>8)lr.vers.splice(0,lr.vers.length-8);lr.vN=(lr.vN||0)+1;bump();const n=lr.vN;showV(lr.vers.length-1);
   const same=!!prev&&prev.p===clip(full,500);
   if(miss.length)App.fb('#l7-fb1','oops','你发现 AI 的错误了！',`要求写「${esc(miss[0].l)}」，${esc(miss[0].ev)}。AI 也会出错，再写一版试试。`,{stars:n>=2?2:1});
   else if(unk.length)App.fb('#l7-fb1','find',`第 ${n} 版写好了，有 ${unk.length} 项要你来判`,`检查器没查到「${esc(unk.slice(0,2).join('」「'))}」。它只认关键词，看诗下面的小问题，你读了再判。`,{stars:n>=2?2:1});
   else if(same)App.fb('#l7-fb1','try',`第 ${n} 版和上一版要求一样`,'在「加要求」里点一条新的，再写，看诗哪里变了。',{stars:n>=2?2:1});
   else if(n>=3)App.fb('#l7-fb1','ok',`第 ${n} 版，${hit} 项要求全中！`,'看诗里的黄底：加的要求都落在了哪里？做一做下面的观察任务。',{stars:3});
   else App.fb('#l7-fb1','find',`${secs(r.ms)} 秒就写完了第 ${n} 版`,n===1?`${rows.length?`要求查到 ${hit}/${rows.length} 项。`:''}在「加要求」里点一条，再写一版，看诗哪里变了。`:'再加一条要求，写到第 3 版。',{stars:n});
   App.touch();drawO1();marks1();fillSrc();}
  catch(e){App.aiSay('#l7-out1',esc(App.AI.errText(e)),{mood:'oops'});}
  finally{S.busy1=false;ctls.delete(ctl);App.busy(b,false);b.classList.add('again');}};
 /* 观察任务：一次只显示一题（教材“观察与发现”三问 + 思考园地第 3 问） */
 const OQ=[{k:'t',q:'AI 写这首诗用了多长时间？',opts:['比我自己写快得多','和我自己写差不多','比我自己写还慢']},{k:'f',q:'AI 写的这首诗读起来流畅吗？',opts:['很流畅','大部分流畅，有几处别扭','不太通顺']},
  {k:'s',q:'这首诗写的内容符合春天的景象吗？',opts:['完全符合','大部分符合','有不符合的地方']},{k:'apps',q:'AI 写字的本领，生活中还能用在哪里？（可多选）',opts:APPS,multi:1}];
 const oDone=q=>q.multi?T1.apps.length>0:O1[q.k]!=null;let oi=OQ.findIndex(q=>!oDone(q));if(oi<0)oi=OQ.length-1;
 const drawO1=()=>{const q=OQ[oi],root=$('#l7-o1');const on=j=>q.multi?T1.apps.includes(j):O1[q.k]===j;const last=lr.vers[lr.vers.length-1];
  root.innerHTML=`<div class="ask"><span class="note">第 ${oi+1} / ${OQ.length} 个${q.k==='t'&&last?` · 这一版用了 ${secs(last.ms)} 秒${last.m==='offline'?'（模拟）':''}`:''}</span><br>${q.q}</div>
   <div class="opts">${q.opts.map((o,j)=>`<button type="button" class="chip ${on(j)?'on':''}" data-o1="${j}">${o}</button>`).join('')}</div>
   <div class="row"><button type="button" class="btn ghost sm" data-op ${oi?'':'hidden'}>上一个</button><button type="button" class="btn ghost sm" data-on ${oi<OQ.length-1&&oDone(q)?'':'hidden'}>下一个</button></div>`;
  $$('[data-o1]',root).forEach(b=>b.onclick=()=>{const j=+b.dataset.o1;if(q.multi)tog(T1.apps,j);else O1[q.k]=j;App.touch();drawO1();});
  $('[data-op]',root).onclick=()=>{oi--;drawO1();};$('[data-on]',root).onclick=()=>{oi++;drawO1();};};
 drawFull();drawCus();drawO1();if(lr.vers.length){showV(lr.vers.length-1);App.ran(s1);}marks1();

 /* ===== EXP-02 提示词对比器 ===== */
 const s2=$('#l7-s2');const C=S.c;
 const cPrompt=()=>`写一首关于春天的现代诗。${C.imgs.size?'写到：'+[...C.imgs].join('、')+'。':''}${C.pers?ADDT.pers:''}${C.sim?ADDT.sim:''}${C.det?ADDT.det:''}${C.feel?`表达出${C.feel}的感受。`:''}${C.rhy?ADDT.rhy:''}`;
 const drawCp=()=>{$('#l7-cp').textContent=cPrompt();};
 multiWire(s2,'ci',k=>C.imgs.has(k),k=>{if(C.imgs.has(k))C.imgs.delete(k);else if(C.imgs.size<4)C.imgs.add(k);else App.toast('最多 4 个意象');drawCp();});
 multiWire(s2,'ct',k=>!!C[k],k=>{C[k]=C[k]?0:1;drawCp();});App.segWire(s2,'cf',v=>{C.feel=v;drawCp();});
 const colHTML=(name,t,rows)=>`<div class="l7-col"><div class="big">${name} · 查到 ${rows.filter(r=>r.ok).length}/${rows.length}</div><div class="l7-poem">${poemHTML(t,{hl:marker(rows,true)})}</div>${chkHTML(rows)}<p class="note">${cliches(t)?`<span class="l7-cl">红线</span>是套话（谁都会写的词），共 ${cliches(t)} 处`:'没有查到套话'}</p></div>`;
 const cmpShow=()=>{const R=S.cmpRes;if(!R)return;const P=parseP(R.sp,[]);App.aiSay('#l7-cout',`<div class="l7-pair">${colHTML('笼统版',R.tv,judged(check(R.tv,P)))}${colHTML('具体版',R.ts,judged(check(R.ts,P)))}</div><p class="note"><span class="l7-hl">黄底</span>是检查器在诗里找到的要求；“？没查到”的，你自己读一读。</p>`,{mood:'happy',src:R.ms||'offline'});};
 const marks2=()=>{if(lr.cmp)App.markStep(s2,0);if(lr.cmpC!=null)App.markStep(s2,1);};
 $('#l7-cgo').onclick=async()=>{if(S.busy2)return;
  if(C.imgs.size<2||!(C.pers||C.sim||C.det||C.feel)){App.fb('#l7-cfb','try','具体版还不够具体','至少选 2 个意象，再加 1 种手法或感受。');if(!lr.cmp)s2.classList.remove('ran');return;}
  const b=$('#l7-cgo');const sp=cPrompt(),vp='写一首关于春天的诗。';S.busy2=true;App.busy(b,true,'两版在写…');const ctl=newCtl();const n=(lr.cmpN||0);let tv='',ts='';
  const live=()=>App.aiSay('#l7-cout',`<div class="l7-pair"><div class="l7-poem">${poemHTML(tv,{cur:true})}</div><div class="l7-poem">${poemHTML(ts,{cur:true})}</div></div>`,{busy:true});live();
  try{const [rv,rs]=await Promise.all([writePoem(vp,{signal:ctl.signal,onText:t=>{tv=t;live();},offline:()=>compose(vp,[],hash(App.rec.id)+n).text}),
    writePoem(sp,{signal:ctl.signal,onText:t=>{ts=t;live();},offline:()=>compose(sp,[],hash(App.rec.id)+n*3).text})]);
   S.cmpRes={sp,tv:rv.text,ts:rs.text,mv:rv.mode,ms:rs.mode};const P=parseP(sp,[]);const cv=check(rv.text,P),cs=check(rs.text,P);
   lr.cmp={sp:clip(sp,300),tv:clip(rv.text,500),ts:clip(rs.text,500),mv:rv.mode,ms:rs.mode,req:cv.length,hv:cv.filter(r=>r.ok).length,hs:cs.filter(r=>r.ok).length,cv:cliches(rv.text),cs:cliches(rs.text)};
   lr.cmpN=n+1;bump();bump();cmpShow();const c=lr.cmp;
   const unk=cs.filter(r=>!r.ok).map(r=>r.l);
   if(c.hs>=c.req&&c.hv<c.req)App.fb('#l7-cfb','ok',`具体版 ${c.hs} 项要求全中！`,`笼统版只查到 ${c.hv} 项${c.cv>c.cs?`，套话 ${c.cv} 处（具体版 ${c.cs} 处）`:''}。两首并排读一读，选出更像你心里的那一版。`,{stars:3});
   else if(c.hs>=c.req)App.fb('#l7-cfb','find','这次两版都查到了全部要求','笼统版碰巧也写到了。换几个意象再写一次，看它还跟不跟得上。',{stars:3});
   else App.fb('#l7-cfb','find',`具体版查到 ${c.hs}/${c.req} 项，笼统版 ${c.hv}/${c.req} 项`,`检查器没查到「${esc(unk.slice(0,2).join('」「'))}」。它只认关键词：你读一读，AI 是真漏了，还是换了说法？`,{stars:2});
   App.touch();marks2();}
  catch(e){App.aiSay('#l7-cout',esc(App.AI.errText(e)),{mood:'oops'});}
  finally{S.busy2=false;ctls.delete(ctl);App.busy(b,false);b.classList.add('again');}};
 chips('#l7-cc',CC,j=>lr.cmpC===j,j=>{lr.cmpC=j;App.touch();marks2();const c=lr.cmp||{};
  App.fb('#l7-cfb','find',`记下了：${CC[j]}`,j===0?'具体的意象、手法和感受，等于告诉 AI 该挑哪几块积木。':j===2?'这不算错。说说看：笼统版里哪一句让你喜欢？':'换几个意象再写一次，差别会不会变大？',{stars:c.hs>c.hv?3:2});});
 if(lr.cmp&&lr.cmp.tv){S.cmpRes={sp:lr.cmp.sp,tv:lr.cmp.tv,ts:lr.cmp.ts,mv:lr.cmp.mv,ms:lr.cmp.ms};cmpShow();App.ran(s2);}
 drawCp();marks2();

 /* ===== EXP-03 AI 仿写李白：先猜格式，再揭晓 ===== */
 const s3=$('#l7-s3');const IM=lr.im;IM.kw=IM.kw||[];IM.md=IM.md||[];IM.f=IM.f||[];IM.r=IM.r||{li:{},ai:{}};IM.r.li=IM.r.li||{};IM.r.ai=IM.r.ai||{};
 const iAuto=()=>{const th=TH.find(t=>t[0]===IM.th);return `请模仿李白的诗歌风格，以“庐山瀑布”为主题，创作一首七言绝句（四句，每句七个字，第二、四句押韵）。${th?'主题：'+th[1]+'。':''}${IM.kw.length?'可以写到：'+IM.kw.join('、')+'。':''}${IM.md.length?'要表现出'+IM.md.join('、')+'的意境。':''}`;};
 const marks3=()=>{if(IM.th&&IM.kw.length)App.markStep(s3,0);if(IM.t)App.markStep(s3,1);};
 const disc=()=>{IM.p=iAuto();App.touch();marks3();};
 App.segWire(s3,'ith',v=>{IM.th=v;disc();});$$('[data-seg="ith"] .chip',s3).forEach(x=>x.classList.toggle('on',x.dataset.v===IM.th));
 multiWire(s3,'ikw',w=>IM.kw.includes(w),w=>{tog(IM.kw,w);disc();});$$('[data-ms="ikw"] .chip',s3).forEach(x=>x.classList.toggle('on',IM.kw.includes(x.dataset.v)));
 multiWire(s3,'imd',w=>IM.md.includes(w),w=>{tog(IM.md,w);disc();});$$('[data-ms="imd"] .chip',s3).forEach(x=>x.classList.toggle('on',IM.md.includes(x.dataset.v)));
 App.segWire(s3,'ig',v=>{S.ig=v==='1';});
 const imitOffline=p=>{const n=IM.n||0;let k=/银河|九天|三千尺|飞流直下/.test(p)?1:/气势|磅礴|雄伟|豪/.test(p)?2:0;k=(k+n)%IMIT.length;return `《庐山瀑布》\n`+IMIT[k].join('\n');};
 /* 句数、字数是数得出来的事实；押韵只在两个句尾字明确同韵时自动判“对”，其余情况（读音表里没有、或韵部不同）请学生读了再判（IM.rhU） */
 const imInfo=()=>{let {title,lines}=clsLines(IM.t);const len=l=>A(l).length;
  if(lines.length===5&&len(lines[0])!==len(lines[1])&&lines.slice(1).every(l=>len(l)===len(lines[1]))){title=title||lines[0];lines=lines.slice(1);}
  const bw=borrowed(lines,LIBAI),f=formOf(lines),cnt=f.n===4&&f.uni&&f.lens[0]===7,e2=(f.ends[1]||{}).c||'',e4=(f.ends[3]||{}).c||'';
  const rh=f.n<4?'no':f.even?'ok':IM.rhU===1?'ok':IM.rhU===0?'no':'unk';
  return {title,lines,bw,f,cnt,rh,e2,e4,ok:cnt&&rh==='ok',pend:cnt&&rh==='unk',same:bw.total?Math.round(100*bw.same/bw.total):0};};
 const hlBw=I=>l=>{let s=esc(l);I.bw.words.forEach(w=>{s=s.split(w).join(`<span class="l7-hl">${w}</span>`);});return s;};
 const showIm=()=>{if(!IM.t)return null;const I=imInfo(),f=I.f;const hl=hlBw(I);
  const y=(st,t)=>`<span class="${st}">${st==='ok'?'✓':st==='no'?'✗':'？'} ${t}</span>`;const b=x=>x?'ok':'no';
  App.aiSay('#l7-iout',`<div class="big">${I.ok?'字数、押韵都对':I.pend?'字数对了，押韵你来听':!I.cnt?'句数或字数不对':'字数对，押韵不顺'}</div>
   <div class="l7-pair"><div class="l7-col"><span class="l7-tag cl">李白原诗</span><div class="l7-poem cls sm">${clsHTML(LIBAI,hl)}</div></div><div class="l7-col"><span class="l7-tag">AI 仿写</span><div class="l7-poem cls sm">${clsHTML(I.lines,hl)}</div></div></div>
   <div class="l7-chk">${y(b(f.n===4),f.n+' 句')}${y(b(f.uni&&f.lens[0]===7),f.uni?'每句 '+(f.lens[0]||0)+' 字':'每句字数不一样')}${f.n>=4?y(I.rh,`第 2、4 句押韵 · 句尾「${esc(I.e2)}」「${esc(I.e4)}」${I.rh==='unk'?' · 拿不准':''}`):''}</div>
   ${I.pend?`<div class="l7-judge"><span>大声读第 2、4 句的最后一个字：「${esc(I.e2)}」「${esc(I.e4)}」。读起来押韵吗？</span><button type="button" class="chip" data-rj="1">押韵</button><button type="button" class="chip" data-rj="0">不押韵</button></div>`:''}
   <p class="note">${I.bw.words.length?'<span class="l7-hl">黄底</span>的词，两首诗里都有：是 AI 从李白原诗借来的；':''}AI 的诗里有 ${I.same}% 的字在原诗里出现过。</p>`,{mood:I.ok?'happy':I.pend?'think':'oops',src:IM.m||'offline'});
  $$('#l7-iout [data-rj]').forEach(x=>x.onclick=()=>{IM.rhU=+x.dataset.rj;App.touch();imFb(showIm());});
  const lb=$('#l7-libai');if(lb)lb.innerHTML=clsHTML(LIBAI,hl);
  IM.form={ok:I.ok?1:0,bw:I.bw.words.length,same:I.same};return I;};
 /* banner for the current poem: only says “AI 错了” for facts that can be counted, or for what the student heard */
 const imFb=I=>{if(!I)return;const g=IM.guess==null?null:!!IM.guess,f=I.f;
  const full=!!(IM.th&&IM.kw.length&&IM.md.length),right=g!=null&&!I.pend&&g===I.ok,st=full&&right?3:g!=null?2:1;
  const tail=(I.bw.words.length?`可是「${esc(niceBw(I.bw.words).slice(0,2).join('」「'))}」是从李白那儿借来的。`:'字数、押韵都像模像样。')+(IM.th&&IM.th!=='壮'?'再读读原诗：它写的是瀑布的壮丽。':full?'去下一站比比气势。':'主题、关键词、意境都选上，再仿写一次。');
  if(!I.cnt)App.fb('#l7-ifb','oops','你发现 AI 的错误了！',`${g===false?'你猜对了：':''}要 4 句、每句 7 个字，它写了 ${f.n} 句（${f.lens.join('、')} 个字）。`,{stars:st});
  else if(I.pend)App.fb('#l7-ifb','find',`${secs(IM.ms)} 秒写完，4 句 7 字都对`,'押韵检查器拿不准。看诗下面的小问题：你读一读，你来判。',{stars:g!=null?2:1});
  else if(!I.ok)App.fb('#l7-ifb','oops','你听出来了：押韵不顺',`${g===false?'你猜对了：':''}字数对，可「${esc(I.e2)}」「${esc(I.e4)}」读起来不押韵。AI 也会出错。`,{stars:st});
  else if(right)App.fb('#l7-ifb','ok',`猜对了，${secs(IM.ms)} 秒，字数押韵全对`,tail,{stars:st});
  else App.fb('#l7-ifb','find',g==null?`${secs(IM.ms)} 秒写完，字数押韵全对`:'和你猜的不一样：字数押韵全对',tail,{stars:st});};
 $('#l7-igo').onclick=async()=>{if(S.busy3)return;const b=$('#l7-igo');const p=iAuto();S.busy3=true;App.busy(b,true,'AI 正在仿写…');App.aiSay('#l7-iout','正在按格律组合词语……',{busy:true});const ctl=newCtl();
  try{const r=await writePoem(p,{kind:'classic',signal:ctl.signal,onText:t=>App.aiSay('#l7-iout',`<div class="l7-poem">${esc(t)}<span class="cur"></span></div>`,{busy:true}),offline:()=>imitOffline(p)});
   IM.t=clip(r.text,400);IM.m=r.mode;IM.ms=Math.round(r.ms);IM.p=clip(p,300);IM.n=(IM.n||0)+1;delete IM.rhU;bump();const g=S.ig;if(g!=null)IM.guess=g?1:0;else delete IM.guess;
   imFb(showIm());App.touch();marks3();fillSrc();drawDuel();}
  catch(e){App.aiSay('#l7-iout',esc(App.AI.errText(e)),{mood:'oops'});}
  finally{S.busy3=false;ctls.delete(ctl);App.busy(b,false);b.classList.add('again');}};
 chips('#l7-if',IMF,i=>IM.f.includes(i),i=>{tog(IM.f,i);App.touch();});
 if(IM.t){showIm();App.ran(s3);}marks3();

 /* ===== EXP-03b 李白对 AI：人机比一比 ===== */
 const s3b=$('#l7-s3b');
 const drawDuel=()=>{const ai=IM.t?clsLines(IM.t).lines:IMIT[0];
  $('#l7-duel').innerHTML=`<div class="l7-card"><h4><span>望庐山瀑布</span><span class="l7-tag cl">唐 · 李白</span></h4><div class="l7-poem cls sm">${clsHTML(LIBAI)}</div></div>
   <div class="l7-card"><h4><span>庐山瀑布</span><span class="l7-tag">${IM.t?'AI 仿写 · '+esc(srcOf(IM.m)):'AI 仿写 · 预置示例'}</span></h4><div class="l7-poem cls sm">${clsHTML(ai)}</div></div>`;};
 const voted=()=>RD.filter(([d])=>IM.r.li[d]&&IM.r.ai[d]);
 const marks3b=()=>{if(voted().length>=3)App.markStep(s3b,0);if((IM.why||'').trim().length>=6)App.markStep(s3b,1);};
 const rateFb=()=>{const R=IM.r,dn=voted(),n=dn.length;if(!n)return;const li=dn.filter(([d])=>R.li[d]>R.ai[d]).length,ai=dn.filter(([d])=>R.ai[d]>R.li[d]).length,why=(IM.why||'').trim().length>=6;
  const st=n>=3?(why?3:2):1,sc=`李白 ${li} : ${ai} AI`;
  /* a judge's vote has no right answer: the banner only reports the student's own score and asks for the reason */
  const aiL=IM.t?imInfo().lines:IMIT[0],bw=niceBw(borrowed(aiL,LIBAI).words);
  const ask=bw.length?`AI 的诗里有「${esc(bw[0])}」，李白的诗里也有：这个词，AI 是自己想出来的，还是借的？`:'李白亲眼见过庐山瀑布，AI 没有。这会让两首诗差在哪里？';
  if(n<3)App.fb('#l7-rfb','find',`你的比分：${sc}`,`已投 ${n}/3 项，接着投。`,{stars:st});
  else if(why)App.fb('#l7-rfb','ok',`你的比分：${sc}，理由记下了`,'评委没有标准答案，说得出理由就是好评委。去下一站看更多对决。',{stars:st});
  else App.fb('#l7-rfb','find',`你的比分：${sc}`,(li>ai?'两首字数、押韵都对，分差从哪里来？':ask)+'在下面写一句。',{stars:st});};
 RD.forEach(([d])=>{const cur=IM.r.li[d]&&IM.r.ai[d]?(IM.r.li[d]>IM.r.ai[d]?'li':IM.r.li[d]<IM.r.ai[d]?'ai':'eq'):'';$$(`[data-seg="r${d}"] .chip`,s3b).forEach(x=>x.classList.toggle('on',x.dataset.v===cur));
  App.segWire(s3b,'r'+d,v=>{IM.r.li[d]=VT[v][0];IM.r.ai[d]=VT[v][1];App.touch();rateFb();marks3b();});});
 let whyOk=(IM.why||'').trim().length>=6;tx('#l7-iwhy',IM,'why',()=>{marks3b();const ok=(IM.why||'').trim().length>=6;if(ok!==whyOk){whyOk=ok;rateFb();}});
 drawDuel();if(voted().length)App.ran(s3b);marks3b();

 /* ===== EXP-04 人机对决墙：先投票，再揭晓 ===== */
 const s4=$('#l7-s4');const W=lr.wall;['v','why','wt','rev','o'].forEach(k=>{if(!W[k]||typeof W[k]!=='object')W[k]={};});
 const order=p=>{if(!W.o[p.id])W.o[p.id]=hash(App.rec.id+p.id)%2?'ca':'ac';return W.o[p.id];};
 const curP=()=>WALL.find(x=>x.id===S.wp)||WALL[0];const NM=['甲','乙'];
 const revN=()=>Object.keys(W.rev).filter(k=>W.v[k]).length,revC=()=>Object.keys(W.rev).filter(k=>W.v[k]==='c').length;
 const marks4=()=>{if(revN()>=1)App.markStep(s4,0);if(revN()>=3)App.markStep(s4,1);};
 const showRev=(p,withFb)=>{const o=order(p),v=W.v[p.id],ci=o.indexOf('c'),f=formOf(p.ai);
  const nx=WALL.find(x=>!(W.rev[x.id]&&W.v[x.id]));
  App.aiSay('#l7-wout',`<div class="big">${NM[ci]}是${esc(p.c.a)}写的，${NM[1-ci]}是 AI 写的</div><p>两首都是 ${f.n} 句、每句 ${f.lens[0]} 个字，都押韵。</p>${nx?`<div class="row"><button type="button" class="btn ghost sm" data-wnx="${nx.id}">下一组：${esc(nx.n)}</button></div>`:''}`,{mood:'think'});
  const nb=$('#l7-wout [data-wnx]');if(nb)nb.onclick=()=>{const c=$(`[data-seg="wp"] .chip[data-v="${nb.dataset.wnx}"]`,s4);if(c)c.click();};
  if(!withFb)return;
  /* 哪首更打动人没有标准答案：两种选择都只描述，不判对错 */
  const n=revN(),more=n<3?`已揭晓 ${n}/3 组，点「下一组」接着投。`:'3 组集齐了，去下一站亮出看法。';
  if(v==='c')App.fb('#l7-wfb','find',`打动你的是${esc(p.c.a)}的诗`,`两首字数、押韵都对，打动你的是哪里？点一点下面的理由。${more}`,{stars:Math.min(3,n)});
  else App.fb('#l7-wfb','find','打动你的是 AI 的诗',`这不算错。它哪里打动你？点一点下面的理由，再读读${esc(p.c.a)}的那首。${more}`,{stars:Math.min(3,n)});};
 const drawWall=()=>{const p=curP(),o=order(p),v=W.v[p.id],rev=W.rev[p.id];
  const card=(slot,k)=>{const c=k==='c';return `<div class="l7-card ${v===k?'l7-on':''} ${rev?'':'l7-vote'}" ${rev?'':`data-wk="${k}" role="button" tabindex="0" aria-label="投票给${slot}"`}><h4><span>${slot}${v===k?' · 我选的':''}</span>${rev?(c?`<span class="l7-tag cl">${esc(p.c.d)} · ${esc(p.c.a)}《${esc(p.c.t)}》</span>`:'<span class="l7-tag">AI 仿写 · 预置示例</span>'):'<span class="l7-tag dim">作者保密</span>'}</h4><div class="l7-poem cls sm">${clsHTML(c?p.c.l:p.ai)}</div></div>`;};
  $('#l7-wall').innerHTML=card('甲',o[0])+card('乙',o[1]);
  $$('#l7-wall [data-wk]').forEach(el=>{const f=()=>{W.v[p.id]=el.dataset.wk;$('#l7-wfb').innerHTML='';App.touch();drawWall();};el.onclick=f;el.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();f();}};});
  $$('[data-seg="wv"] .chip',s4).forEach((b,i)=>{b.classList.toggle('on',v===o[i]);b.disabled=!!rev;});drawWr();
  /* the “why” record only shows for a pair that has been revealed */
  const pad=$('#l7-wr').closest('.after-run');if(pad)pad.style.display=rev&&v?'':'none';
  if(rev&&v)showRev(p,false);else{App.aiSay('#l7-wout',v?`你选了${NM[o.indexOf(v)]}。按「揭晓作者」看看谁是 AI`:'点左边的一首诗投票，再按「揭晓作者」',{mood:'idle'});$('#l7-wout').classList.add('wait');}};
 const drawWr=chips('#l7-wr',WR,i=>(W.why[curP().id]||[]).includes(i),i=>{const id=curP().id;tog(W.why[id]=W.why[id]||[],i);App.touch();});
 App.segWire(s4,'wp',v=>{S.wp=v;$('#l7-wfb').innerHTML='';drawWall();});
 App.segWire(s4,'wv',v=>{const p=curP();if(W.rev[p.id])return;W.v[p.id]=order(p)[+v];$('#l7-wfb').innerHTML='';App.touch();drawWall();});
 $('#l7-wrev').onclick=()=>{const p=curP();if(!W.v[p.id]){App.fb('#l7-wfb','try','先投票，再揭晓','点左边的诗（或点「甲」「乙」）：哪一首更打动你？');if(!revN())s4.classList.remove('ran');return;}
  W.rev[p.id]=1;App.touch();drawWall();showRev(p,true);marks4();drawTalk();$('#l7-wrev').classList.add('again');};
 drawWall();marks4();if(revN())App.ran(s4);

 /* ===== TALK AI 的诗能打动人吗 ===== */
 const s4b=$('#l7-s4b');
 const drawTalk=()=>{const n=revN(),c=revC();$('#l7-talk').innerHTML=`<h4><span>我在对决墙的投票</span></h4><div class="l7-big">诗人 ${c} : ${n-c} AI</div>`+WALL.map((p,i)=>{const v=W.v[p.id],rev=W.rev[p.id];
   return `<div class="l7-vrow"><span>第 ${i+1} 组 · ${p.n}</span>${rev&&v?(v==='c'?'<span class="l7-tag cl">选了诗人的诗</span>':'<span class="l7-tag">选了 AI 的诗</span>'):'<span class="l7-tag dim">还没揭晓</span>'}</div>`;}).join('');};
 const marks4b=()=>{if(W.st)App.markStep(s4b,0);if((W.sw||'').trim().length>=6)App.markStep(s4b,1);};
 const talkFb=()=>{if(!W.st)return;const n=revN(),c=revC(),why=(W.sw||'').trim().length>=6;
  App.fb('#l7-tfb',why?'ok':'find',why?'看法和理由都记下了！':'看法记下了',(n?`你揭晓的 ${n} 组里，${c} 组选了诗人的诗。`:'你还没在对决墙投过票，回上一站投几组。')+(why?'':'写一句理由。'),{stars:why?3:n>=3?2:1});};
 $$('[data-seg="ws"] .chip',s4b).forEach(x=>x.classList.toggle('on',x.dataset.v===W.st));
 App.segWire(s4b,'ws',v=>{W.st=v;if(!W.stFirst)W.stFirst=v;App.touch();talkFb();marks4b();});
 let swOk=(W.sw||'').trim().length>=6;tx('#l7-wsw',W,'sw',()=>{marks4b();const ok=(W.sw||'').trim().length>=6;if(ok!==swOk){swOk=ok;talkFb();}});
 drawTalk();marks4b();if(W.st)App.ran(s4b);

 /* ===== EXP-05 改写定稿 ===== */
 const s5=$('#l7-s5');const F=lr.fin;const ft=$('#l7-ftext');if(!Array.isArray(F.how))F.how=[];
 const DEF=()=>compose('请围绕“春天”写一首现代诗。写到：阳光、小草、小鸟。',[],7).text;
 const srcs=()=>{const a=lr.vers.map((v,i)=>({k:'v'+i,n:`诗词工坊 第 ${vNo(i)} 版`,s:`工坊第 ${vNo(i)} 版`,t:v.t,m:v.m})).slice(-3);if(IM.t)a.push({k:'im',n:'AI 仿写李白',s:'仿李白',t:IM.t,m:IM.m});
  if(!a.length)a.push({k:'d',n:'示例初稿',s:'示例初稿',t:DEF(),m:'offline'});return a;};
 function lcs(a,b){const n=a.length,m=b.length;const d=new Uint16Array((n+1)*(m+1));for(let i=n-1;i>=0;i--)for(let j=m-1;j>=0;j--)d[i*(m+1)+j]=a[i]===b[j]?d[(i+1)*(m+1)+j+1]+1:Math.max(d[(i+1)*(m+1)+j],d[i*(m+1)+j+1]);
  const ops=[];let i=0,j=0;while(i<n&&j<m){if(a[i]===b[j]){ops.push(['=',b[j]]);i++;j++;}else if(d[(i+1)*(m+1)+j]>=d[i*(m+1)+j+1]){ops.push(['-',a[i]]);i++;}else{ops.push(['+',b[j]]);j++;}}
  while(i<n)ops.push(['-',a[i++]]);while(j<m)ops.push(['+',b[j++]]);return {k:d[0],ops};}
 const ratioOf=(a,b)=>{const x=clean(a),y=clean(b);if(!y.length)return {r:0,nw:0};const {k}=lcs(x,y);return {r:1-k/Math.max(x.length,y.length),nw:(y.length-k)/y.length};};
 const noteTxt=()=>F.how.length?`初稿是 AI 写的（${F.srcN||'AI 初稿'}）。我${F.how.slice().sort().map(i=>HOW[i]).join('、')}。`:'';
 const labelTxt=()=>`本诗初稿由 AI 生成（${srcOf(F.m)}，${F.srcN||'AI 初稿'}），我在初稿上改写，定稿中我自己写的字约占 ${Math.round((F.nw||0)*100)}%。`;
 const drawDiff=()=>{const a=A(F.base||''),b=A(ft.value||'');const {ops}=lcs(a.slice(0,600),b.slice(0,600));let h='',cur='',buf='';const flush=()=>{if(!buf)return;h+=cur==='+'?`<ins>${esc(buf)}</ins>`:cur==='-'?`<del>${esc(buf)}</del>`:esc(buf);buf='';};
  ops.forEach(([o,c])=>{if(o==='-'&&c==='\n')return;if(o!==cur){flush();cur=o;}buf+=c;});flush();$('#l7-fdiff').innerHTML=h;
  const R=ratioOf(F.base,ft.value);F.ratio=Math.round(R.r*100)/100;F.nw=Math.round(R.nw*100)/100;const pc=Math.round(R.nw*100);
  $('#l7-fpct').textContent=pc+'%';$('#l7-fmeter').style.width=pc+'%';$('#l7-flabel').textContent=labelTxt();
  /* live 套话 list: the words found in the AI draft; each turns green once the student has replaced it */
  ft.rows=Math.max(10,Math.min(24,ft.value.split('\n').length+1));
  const c0=CLICHE.filter(w=>(F.base||'').includes(w)),now=ft.value;$('#l7-fbase').textContent=F.srcN||'AI 初稿';
  $('#l7-fcl').innerHTML=c0.length?`<span class="l7-lab">初稿里的套话</span>${c0.slice(0,6).map(w=>now.includes(w)?`<em>${esc(w)}</em>`:`<em class="ok">✓ ${esc(w)} 换掉了</em>`).join('')}<span class="note">${c0.every(w=>!now.includes(w))?'套话清零！':'先把红色的词换成你见过的东西'}</span>`:'<span class="note">这份初稿没查到套话。加进你真的见过、听过的东西。</span>';};
 const pickSrc=(s,quiet)=>{S.src=s.k;S.swArm=null;F.base=clip(s.t,600);F.m=s.m;F.srcN=s.n;F.cls=s.k==='im'?1:0;ft.value=F.base;F.text=F.base;F.title=poemLines(s.t).title||'';if(!quiet)App.touch();drawSrc();drawDiff();};
 const drawSrc=()=>{const L_=srcs();if(!S.src||!L_.some(s=>s.k===S.src))S.src=(L_.find(s=>s.t===F.base)||{}).k||null;
  $('#l7-fsrc').innerHTML=L_.map(s=>`<button type="button" class="chip ${S.src===s.k?'on':''}" data-fs="${s.k}">${esc(s.s)}</button>`).join('');
  $$('[data-fs]',s5).forEach(b=>b.onclick=()=>{const s=srcs().find(x=>x.k===b.dataset.fs);if(!s||s.k===S.src)return;
   if(F.base&&ft.value!==F.base&&S.swArm!==s.k){S.swArm=s.k;App.toast('再点一次就换初稿，改过的字会丢掉');return;}S.srcPicked=1;pickSrc(s);marks5();});};
 /* called whenever a new AI poem exists: keep the draft list fresh; an untouched draft follows the newest poem */
 const fillSrc=()=>{const L_=srcs();const newest=L_.filter(s=>s.k[0]==='v').pop()||L_[0];
  const untouched=!F.saved&&!S.srcPicked&&(!F.base||(ft.value===F.base&&newest.t!==F.base));
  if(untouched)pickSrc(newest,true);else drawSrc();};
 const marks5=()=>{if((F.ratio||0)>=0.05)App.markStep(s5,0);if(F.saved)App.markStep(s5,1);};
 ft.value=F.text||F.base||'';let fdt;ft.addEventListener('input',()=>{F.text=clip(ft.value,600);drawDiff();if($('#l7-ffb .fbx.try')&&(F.ratio||0)>=0.05)$('#l7-ffb').innerHTML='';clearTimeout(fdt);fdt=setTimeout(()=>{App.touch();marks5();},600);});
 const offSug=()=>{const t=F.base||'';const {lines}=F.cls?clsLines(t):poemLines(t);const out=[];
  const cl=CLICHE.filter(w=>t.includes(w));if(cl.length)out.push(`“${cl.slice(0,3).join('”“')}”这类词很常见，读者已经读过很多遍。试着换成你亲眼看到的一个细节。`);
  const cnt={};lines.forEach(l=>{const a=A(l);for(let i=0;i<a.length-1;i++){const w=a[i]+a[i+1];if(HZ.test(a[i])&&HZ.test(a[i+1]))cnt[w]=(cnt[w]||0)+1;}});const rep=Object.entries(cnt).filter(x=>x[1]>=3).sort((a,b)=>b[1]-a[1])[0];
  if(rep)out.push(`“${rep[0]}”出现了 ${rep[1]} 次，可以删掉几处，或换一种说法。`);
  if(F.cls){const bw=borrowed(lines,LIBAI);if(bw.words.length)out.push(`初稿借用了李白原诗的“${bw.words.slice(0,3).join('”“')}”。改写时试着用你自己的比喻来写瀑布的气势。`);}
  else if(!/我/.test(t))out.push('诗里还没有“我”：加一两句你自己在春天里做了什么、想到了什么。');
  const long=lines.map((l,i)=>[i,A(l).length]).find(x=>x[1]>16);if(long)out.push(`第 ${long[0]+1} 行有 ${long[1]} 个字，读起来有点长，可以拆成两行。`);
  const sn=[...new Set(t.match(SENSE_RE)||[])].length;if(!F.cls&&sn<3)out.push('诗里的颜色、声音、气味还不多：找一处加上你听到或闻到的东西。');
  const tt=poemLines(t).title;if(tt&&/^春天的|^春天$|^庐山瀑布$/.test(tt))out.push(`题目“${tt}”是 AI 按主题随手起的，换一个只属于你这首诗的题目。`);
  out.push('想一想：哪一句是你真的见过、听过、闻过的？把它写得更具体，这一句就只属于你。');return out.slice(0,3);};
 $('#l7-fsug').onclick=async()=>{const b=$('#l7-fsug');b.disabled=true;App.aiSay('#l7-fsugout','参谋正在读初稿……',{busy:true});let list=null,mode='offline';
  if(App.AI.real()){const ctl=newCtl();try{const r=await App.AI.chat(`下面是一首由 AI 写的诗的初稿，一个小学生准备把它改写成自己的作品。请你当“写作参谋”，给出 3 条具体的修改建议（每条不超过 40 个字），不要替他改写整首诗。每条一行，用“1.”“2.”“3.”开头。\n\n${F.base}`,{tier:'quick',signal:ctl.signal});
    if(r&&r.text){list=r.text.split('\n').map(x=>x.replace(/^\s*\d+[.、．]\s*/,'').trim()).filter(x=>x&&HZ.test(x)).slice(0,3);mode=r.mode||App.AI.mode();}}
   catch(e){App.AI.fail(e);App.toast(App.AI.errText(e));}finally{ctls.delete(ctl);}}
  if(!list||!list.length)list=offSug();F.sugN=(F.sugN||0)+1;bump();App.touch();
  App.aiSay('#l7-fsugout',`<ol class="l7-sug">${list.map(x=>`<li>${esc(x)}</li>`).join('')}</ol>`,{mood:'think',src:mode});b.disabled=false;};
 $('#l7-freset').onclick=()=>{if(!F.base||ft.value===F.base){App.toast('现在就是初稿，直接改吧');return;}
  if(!S.rsArm){S.rsArm=1;App.toast('再点一次就回到 AI 初稿，改过的字会丢掉');setTimeout(()=>{S.rsArm=0;},4000);return;}
  S.rsArm=0;ft.value=F.base;F.text=F.base;drawDiff();App.touch();App.toast('已回到 AI 初稿');};
 $('#l7-fsave').onclick=()=>{const t=ft.value.trim();drawDiff();const pc=Math.round((F.nw||0)*100);
  if(A(t).length<10){App.fb('#l7-ffb','try','诗太短了','至少留下两三行，再保存。');if(!F.saved)s5.classList.remove('ran');return;}
  if((F.ratio||0)<0.05){App.fb('#l7-ffb','try','还没动笔呢','先换掉一句套话，加进你真的见过、感受过的东西，再保存。');if(!F.saved)s5.classList.remove('ran');return;}
  F.text=clip(t,600);F.title=clip(poemLines(t).title||'',20);F.saved=Date.now();App.touch();marks5();
  if((F.nw||0)>=0.3)App.fb('#l7-ffb','ok',`定稿好了！自己写的字占 ${pc}%`,'这首诗已经带上你的印记，存进了作品墙。点一点：你改了什么？',{stars:3});
  else App.fb('#l7-ffb','find',`定稿存好了，自己写的字占 ${pc}%`,'再加一两句自己的观察，冲过 30% 的虚线，再保存一次。',{stars:(F.nw||0)>=0.1?2:1});
  $('#l7-fsave').classList.add('again');};
 chips('#l7-fhow',HOW,i=>F.how.includes(i),i=>{tog(F.how,i);F.note=noteTxt();App.touch();});
 $('#l7-flabelck').checked=!!F.label;$('#l7-flabelck').onchange=e=>{F.label=e.target.checked?1:0;App.touch();};
 fillSrc();drawDiff();marks5();if(F.saved)App.ran(s5);

 /* ===== quiz + diary ===== */
 App.quiz($('#l7-quiz'),K,QUIZ);
 const rd=App.diary($('#l7-diary'),K,{title:L.diaryTitle,lead:'用你的定稿诗作和实验发现来回答',
  fields:[{id:'rely',q:'虽然 AI 能生成文字，但我们能完全依赖它进行文学创作吗？',ph:'我认为……，因为在仿写挑战赛／对决墙里我发现……'},
   {id:'assist',q:'如果你要进行文学创作，应该让 AI 怎么协助你？',ph:'我会让 AI 帮我……；但是……要我自己来写'},
   {id:'appre',q:'鉴赏心得：AI 的诗和经典诗相比，哪首更打动你？为什么？',ph:'我觉得《……》更打动我，因为……'},
   {id:'future',q:'请你畅想一下：未来 AI 的写诗能力会有什么新发展？',ph:'我想象未来的 AI……'}],
  pledge:'用 AI 写作时，我会说明哪些部分是 AI 生成的，核心的创意和情感由我自己来写。',
  extras:ex=>{const l=App.lesson(K);const f=l.fin||{},im=l.im||{},w=l.wall||{},c=l.cmp;const vs=l.vers||[];
   const adds=[...new Set(vs.flatMap(v=>(v.a||[]).map(addName)))];const nv=Object.keys(w.rev||{}).filter(k=>(w.v||{})[k]).length,nc=Object.keys(w.rev||{}).filter(k=>(w.v||{})[k]==='c').length;
   const sum=k=>RD.reduce((s,[d])=>s+(((im.r||{})[k]||{})[d]||0),0);
   ex.innerHTML=`<div class="l7-dex"><div><div class="box-t">我的 AI 诗作</div>${f.saved?`<div class="l7-poem"><span class="tt">《${esc(f.title||'无题')}》</span>${esc(poemLines(f.text).lines.join('\n')||f.text)}</div><p class="note" style="margin-top:4px">${esc(`初稿：${f.srcN||'AI 初稿'}（${srcOf(f.m)}）· 改动 ${Math.round((f.ratio||0)*100)}% · 自己写的字约占 ${Math.round((f.nw||0)*100)}%${f.label?' · 已附 AI 参与说明':''}`)}</p>${f.note?`<p style="margin-top:4px">创作说明：${esc(f.note)}</p>`:''}`:'<p class="note">在「改写定稿」里保存后显示。</p>'}</div>
    <div><div class="box-t">诗词工坊</div><p>共写了 ${l.vN||0} 版${vs.length?`，第 1 版用时 ${(vs[0].ms/1000).toFixed(1)} 秒`:''}；用过的追加要求：${adds.length?esc(adds.join('、')):'无'}</p>
     <p>提示词对比器：${c?`要求 ${c.req} 项，笼统版命中 ${c.hv} 项，具体版命中 ${c.hs} 项`:'还没有运行'}</p></div>
    <div><div class="box-t">仿写挑战赛 · 人机对决墙</div><p>${im.t?`AI 仿写格式检查：${im.form&&im.form.ok?'全部符合':'有不符合的地方'}；我的评分：李白 ${sum('li')} 分 / AI ${sum('ai')} 分`:'还没有仿写'}</p>
     <p>对决墙：揭晓 ${nv} 组，${nc} 组选了经典诗${w.st?'；我的观点：'+esc((STANCE.find(s=>s[0]===w.st)||[])[1]||''):''}</p></div></div>`;}});
 L._rd=rd;if(!L._on){L._on=1;App.on(()=>{if(App.current===K&&L._rd)L._rd();});}
 L._refresh=()=>{drawTalk();drawDuel();fillSrc();};
}
L.onShow=()=>{if(L._refresh)L._refresh();};
L.onHide=()=>{stopAll();};

/* ---------- hooks ---------- */
const addsUsed=lr=>{const s=new Set();(lr.vers||[]).forEach(v=>(v.a||[]).forEach(a=>s.add(a.split(':')[0])));return s;};
const wallReasons=w=>Object.keys((w||{}).v||{}).filter(p=>((w.why||{})[p]||[]).length||((w.wt||{})[p]||'').trim().length>=4).length;
L.score=lr=>{const Q=lr.quiz||{},qs=id=>Q[id]?(Q[id].ok?100:0):0,tx=App.txtScore,D=lr.diary||{};
 const b=lr.blk||{},o1=lr.o1||{},t1=lr.t1||{},c=lr.cmp,im=lr.im||{},w=lr.wall||{},f=lr.fin||{};const vN=lr.vN||(lr.vers||[]).length;
 const r=im.r||{};const nR=['li','ai'].reduce((s,k)=>s+RD.filter(([d])=>(r[k]||{})[d]).length,0);const nbs=(lr.bs||[]).length+(lr.bsC||[]).length;
 return {principle:20*Math.min(1,(b.co||[]).length/2)+20*(b.n?1:0)+(b.q?(b.q.first===1?20:b.q.last===1?10:0):0)+0.2*qs('q1')+0.2*qs('q3'),
  experiment:30*Math.min(1,vN/3)+8*['t','f','s'].filter(k=>o1[k]!=null).length+20*Math.min(1,lr.cmpN||0)+(im.t?14:0)+12*Math.min(1,(t1.apps||[]).length/2),
  prompt:(vN?15*Math.min(1,nbs/3):0)+30*Math.min(1,addsUsed(lr).size/4)+(c&&c.req?25*c.hs/c.req:0)+15*Math.min(1,((im.kw||[]).length+(im.md||[]).length)/3)+0.15*qs('q2'),
  critical:10*Math.min(1,(im.f||[]).length/2)+15*Math.min(1,nR/6)+(im.move?0.15*tx(im.why,30)+0.1*tx(im.move,25):0.25*tx(im.why,30))+25*Math.min(1,wallReasons(w)/3)+(w.st?8:0)+0.07*tx(w.sw,25)+0.1*qs('q4'),
  creative:(f.saved?20:0)+30*Math.min(1,(f.nw||0)/0.3)+(f.saved&&f.title?10:0)+(Array.isArray(f.how)&&f.how.length?15*Math.min(1,f.how.length/2):0.15*tx(f.note,30))+0.15*tx(D.appre,30)+10*Math.min(1,(lr.bsC||[]).length),
  ethics:(D.pledge?30:0)+(f.saved&&f.label?25:0)+(/AI|人工智能|电脑/i.test(f.note||'')?10:0)+0.2*qs('q5')+0.15*tx(D.rely,30)};};
L.progress=lr=>{const b=lr.blk||{},o1=lr.o1||{},im=lr.im||{},w=lr.wall||{},r=im.r||{};const vN=lr.vN||(lr.vers||[]).length;
 const m=[!!b.n,vN>=1&&((lr.bs||[]).length+(lr.bsC||[]).length)>=3,vN>=3,['t','f','s'].every(k=>o1[k]!=null),(lr.cmpN||0)>=1,
  !!im.t&&RD.every(([d])=>(r.li||{})[d]&&(r.ai||{})[d]),Object.keys(w.v||{}).length>=3&&!!w.st,!!(lr.fin||{}).saved,Object.keys(lr.quiz||{}).length>=5,!!(lr.diary||{}).submitted];
 return m.filter(Boolean).length/m.length;};
L.quiz=QUIZ;
L.flow=[
 {seg:'导入',from:'l7-s0'},
 {seg:'挑战一',kp:'知识点一 · AI 写诗像“拼积木”',learn:['AI 学过海量诗歌，记住了字词的组合规律','给个主题，它挑相关字词、按诗的格式拼起来：快、格式对','提示词越具体（意象、修辞、感受、格式），诗越贴近想法'],sum:['“春”的好搭档是数出来的，生成器没感受过春风','几秒写成、格式整齐；具体提示词命中更多、套话更少'],from:'l7-s1',to:'l7-s2'},
 {seg:'挑战二',kp:'知识点二 · 能仿格律，难有真情',learn:['AI 了解古诗格律，能模仿李白的风格','却难再现豪迈的情感、天马行空的想象力','李白源于亲身体验和内心触动，AI 只是排列组合词语'],sum:['仿写格式全对，“银河”“三千尺”却是借来的','打动人的是独特的视角和真实的感受，不是格式'],from:'l7-s3',to:'l7-s4'},
 {seg:'综合运用',from:'l7-s5'},
 {seg:'反思与总结',from:'l7-quiz-st'}
];
L.diaryTitle='我的 AI 诗作';
L.diaryQ=[['rely','能完全依赖 AI 创作吗'],['assist','让 AI 怎么协助我'],['appre','鉴赏心得'],['future','畅想未来 AI 写诗']];
const xe=s=>String(s||'').replace(/[<&>"]/g,'');
const card=(title,lines,tag,color)=>'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 200"><rect width="320" height="200" fill="#fffdf3"/><path d="M0 52H320M0 80H320M0 108H320M0 136H320M0 164H320" stroke="#e9e2c4"/><rect x="0" y="0" width="6" height="200" fill="${color}"/><text x="24" y="40" font-size="17" font-weight="700" fill="${color}" font-family="Noto Serif SC,serif">${xe(cut(title,14))}</text>${lines.slice(0,4).map((l,i)=>`<text x="24" y="${78+i*28}" font-size="16" fill="#1b2550" font-family="Noto Serif SC,serif">${xe(cut(l,16))}</text>`).join('')}<text x="296" y="186" font-size="11" fill="#4c5884" text-anchor="end" font-family="Noto Sans SC,sans-serif">${xe(tag)}</text></svg>`);
L.works=lr=>{const o=[];const f=lr.fin||{};
 if(f.saved&&f.text){const ls=(f.cls?clsLines(f.text):poemLines(f.text)).lines;o.push({t:`我的 AI 诗作 ·《${f.title||'无题'}》`,s:`${cut(ls.slice(0,2).join(' / '),36)} · AI 初稿，自己写的字约占 ${Math.round((f.nw||0)*100)}%`,img:card('《'+(f.title||'无题')+'》',ls,'AI 初稿 · 本人改写定稿','#cf4526')});}
 const vs=lr.vers||[];if(vs.length){const best=vs.reduce((a,v)=>v.hit/(v.req||1)>=a.hit/(a.req||1)?v:a,vs[0]);const ls=poemLines(best.t).lines;o.push({t:'诗词工坊 · AI 写的春天',s:`共 ${lr.vN||vs.length} 版；这一版命中要求 ${best.hit}/${best.req}`,img:card(poemLines(best.t).title||'春天',ls,'AI 生成','#2f6bff')});}
 const im=lr.im||{};if(im.t){const ls=clsLines(im.t).lines;o.push({t:'仿写挑战赛 · AI 仿李白',s:`格式检查${im.form&&im.form.ok?'全部符合':'有不符合'}；借用原诗词语 ${(im.form||{}).bw||0} 个`,img:card('AI 仿《望庐山瀑布》',ls,'AI 生成','#5b3dcc')});}
 return o;};
L.expCount=lr=>lr.nExp||0;
L.classPanels=recs=>{const R=recs.map(r=>(r.lessons||{})[K]||{}).filter(l=>Object.keys(l).length);if(!R.length)return '';
 const bar=(n,v,tot,col,lab)=>`<div class="hbar"><span>${n}</span><span class="tr"><i style="width:${tot?100*v/tot:0}%;background:${col}"></i></span><span>${lab!=null?lab:v}</span></div>`;
 const W_=R.filter(l=>(l.vN||(l.vers||[]).length)>0);const avgV=W_.length?W_.reduce((s,l)=>s+(l.vN||(l.vers||[]).length),0)/W_.length:0;
 const dist=[[1,1,'只写 1 版'],[2,2,'2 版'],[3,99,'3 版及以上']].map(([a,b,n])=>[n,W_.filter(l=>{const v=l.vN||(l.vers||[]).length;return v>=a&&v<=b;}).length]);
 const addC=ADDS.map(([k,n])=>[n,R.filter(l=>addsUsed(l).has(k)).length]);const addMx=Math.max(1,...addC.map(x=>x[1]));
 const CM=R.map(l=>l.cmp).filter(c=>c&&c.req);const hv=CM.length?CM.reduce((s,c)=>s+c.hv/c.req,0)/CM.length:0,hs=CM.length?CM.reduce((s,c)=>s+c.hs/c.req,0)/CM.length:0;
 const FN=R.map(l=>l.fin||{}).filter(f=>f.saved);const fb=[[0,0.1,'少于 10%'],[0.1,0.3,'10%–30%'],[0.3,0.6,'30%–60%'],[0.6,1.01,'60% 以上']].map(([a,b,n])=>[n,FN.filter(f=>(f.nw||0)>=a&&(f.nw||0)<b).length]);
 const avgNw=FN.length?FN.reduce((s,f)=>s+(f.nw||0),0)/FN.length:0;
 const pk=WALL.map((p,i)=>{let c=0,a=0;R.forEach(l=>{const v=((l.wall||{}).v||{})[p.id];if(v==='c')c++;if(v==='a')a++;});return `<div class="hbar"><span>第 ${i+1} 组 · ${p.n}</span><span class="tr" style="display:flex"><i style="width:${c+a?100*c/(c+a):0}%;background:var(--green);border-radius:3px 0 0 3px"></i><i style="width:${c+a?100*a/(c+a):0}%;background:var(--violet);border-radius:0 3px 3px 0"></i></span><span>${c}:${a}</span></div>`;}).join('');
 const wr=WR.map((t,i)=>[t,R.reduce((s,l)=>s+Object.values((l.wall||{}).why||{}).filter(a=>Array.isArray(a)&&a.includes(i)).length,0)]).sort((a,b)=>b[1]-a[1]);const wrMx=Math.max(1,wr[0][1]);
 const st={};STANCE.forEach(([k])=>st[k]=0);R.forEach(l=>{const s=(l.wall||{}).stFirst||(l.wall||{}).st;if(s&&s in st)st[s]++;});const stN=Object.values(st).reduce((a,b)=>a+b,0);
 const IR=R.map(l=>(l.im||{}).r).filter(r=>r&&r.li&&r.ai&&RD.every(([d])=>r.li[d]&&r.ai[d]));const av=(w,d)=>IR.length?(IR.reduce((s,r)=>s+r[w][d],0)/IR.length).toFixed(1):'—';
 return `<div class="box"><div class="box-t">第7讲 · 诗词工坊：迭代与提示词</div><p style="font-size:13.5px">平均每人写了 <b class="mono">${avgV.toFixed(1)}</b> 版（${W_.length} 人参与）</p>${dist.map(([n,v])=>bar(n,v,W_.length,'var(--cyan)')).join('')}
   <b style="font-size:13px;display:block;margin-top:8px">用过各项追加要求的人数</b>${addC.map(([n,v])=>bar(n,v,addMx,'var(--amber)')).join('')}
   <b style="font-size:13px;display:block;margin-top:8px">提示词对比器：要求命中率（${CM.length} 人）</b>${bar('笼统版',Math.round(hv*100),100,'var(--dim)',Math.round(hv*100)+'%')}${bar('具体版',Math.round(hs*100),100,'var(--green)',Math.round(hs*100)+'%')}
   <b style="font-size:13px;display:block;margin-top:8px">改写定稿：自己写的字占比（${FN.length} 人，平均 ${Math.round(avgNw*100)}%）</b>${fb.map(([n,v])=>bar(n,v,FN.length,'var(--violet)')).join('')}</div>
  <div class="box"><div class="box-t">第7讲 · 人机对决墙与仿写挑战</div><b style="font-size:13px">哪首更打动人（<span style="color:var(--green)">经典诗</span> : <span style="color:var(--violet)">AI 仿写</span>）</b>${pk}
   <b style="font-size:13px;display:block;margin-top:8px">投票理由（人次）</b>${wr.slice(0,5).map(([t,v])=>bar(t,v,wrMx,'var(--cyan)')).join('')}
   <b style="font-size:13px;display:block;margin-top:8px">AI 的诗能打动人吗？（第一次表态，${stN} 人）</b>${STANCE.map(([k,t])=>bar(t.split('，')[0],st[k],stN,k==='yes'?'var(--red)':k==='some'?'var(--amber)':'var(--green)')).join('')}
   <b style="font-size:13px;display:block;margin-top:8px">仿写挑战平均评分（${IR.length} 人，李白 / AI）</b>${RD.map(([d,n])=>`<div class="hbar"><span>${n}</span><span class="tr" style="display:flex;gap:2px"><i style="width:${IR.length?av('li',d)*10:0}%;background:var(--green)"></i><i style="width:${IR.length?av('ai',d)*10:0}%;background:var(--violet)"></i></span><span>${av('li',d)}/${av('ai',d)}</span></div>`).join('')}</div>`;};
L.classSug=recs=>{const R=recs.map(r=>(r.lessons||{})[K]||{}).filter(l=>Object.keys(l).length);if(!R.length)return [];const out=[];
 let worst=null;WALL.forEach((p,i)=>{let c=0,a=0;R.forEach(l=>{const v=((l.wall||{}).v||{})[p.id];if(v==='c')c++;if(v==='a')a++;});if(c+a>=4&&(!worst||a/(c+a)>worst.r))worst={p,i,r:a/(c+a),a,n:c+a};});
 if(worst&&worst.r>=0.35)out.push(`人机对决墙第 ${worst.i+1} 组（${worst.p.n}）有 ${worst.a}/${worst.n} 名学生觉得 AI 仿写更打动人：把《${worst.p.c.t}》和 AI 那首并排投影，请学生圈出 AI 诗里的“常见形容词”，再找出原诗里只有诗人亲身经历才写得出的细节。`);
 const W_=R.filter(l=>(l.vN||(l.vers||[]).length)>0);const few=W_.filter(l=>(l.vN||(l.vers||[]).length)<3).length;
 if(W_.length>=3&&few/W_.length>=0.4)out.push(`${few}/${W_.length} 名学生在诗词工坊里不到 3 版就停下了：示范一次“只加一条追加要求（如拟人）→ 对照自动检查 → 再加一条”，让学生体会提示词怎样一步步改变诗。`);
 const FN=R.map(l=>l.fin||{}).filter(f=>f.saved);const low=FN.filter(f=>(f.nw||0)<0.1).length;
 if(out.length<2&&FN.length>=3&&low/FN.length>=0.3)out.push(`有 ${low} 名学生的定稿里自己写的字不到 10%：请他们找出初稿里的一句套话，换成自己亲眼见过的一个春天细节，再保存一次。`);
 return out.slice(0,2);};
L.demo=(rnd,t)=>{const p=x=>rnd()<x;const pk=a=>a[Math.floor(rnd()*a.length)];const lr={};
 lr.blk={co:p(.4+t*.5)?['春','风'].slice(0,p(t)?2:1):[],n:p(.5+t*.4)?1+Math.floor(rnd()*3):0};if(p(.4+t*.5)){const ok=p(.5+t*.45);lr.blk.q={first:ok?1:pk([0,2]),last:p(.3+t*.6)?1:0};}
 lr.bs=IMG.map(m=>m.k).filter(()=>p(.25+t*.15)).slice(0,6);if(lr.bs.length<2)lr.bs=['阳光','小草','小鸟'];lr.bsC=p(t*.6)?[pk(['油菜花','新芽','柳絮','蒲公英'])]:[];
 const vN=Math.max(1,Math.round(0.8+t*4.4*(0.35+0.7*rnd())));lr.vN=vN;const pool=['det','pers','sim','feel:温暖','feel:快乐','rhy','lines:8'];let acc=[];
 lr.vers=Array.from({length:Math.min(vN,8)},(_,i)=>{if(i>0){const a=pk(pool);if(!acc.includes(a))acc=acc.concat(a);}const req=lr.bs.length+acc.length;const hit=Math.max(0,req-(p(.3)?1:0));return {p:'请围绕“春天”这一主题，写一首现代诗。',a:acc.slice(),t:'《春天的阳光》\n阳光伸出金色的手指\n轻轻敲醒熟睡的屋顶',m:'offline',ms:Math.round(1600+rnd()*1400),f:Math.round(500+rnd()*500),req,hit};});
 lr.o1={};if(p(.4+t*.6))lr.o1.t=p(.85)?0:1;if(p(.35+t*.6))lr.o1.f=pk([0,1,1,2]);if(p(.35+t*.6))lr.o1.s=pk([0,1,1,2]);
 lr.t1={adv:p(t+.1)?pk(['写得特别快，几秒钟就好了，格式也很整齐。','词语很丰富，还会押韵。']):'',how:p(t)?pk(['提示词写具体一点，比如加上拟人、写出桃花。','告诉它要写哪些景物、用什么修辞。']):'',apps:[0,1,4].filter(()=>p(.3+t*.5))};
 if(p(.3+t*.65)){const req=4+Math.floor(rnd()*3);lr.cmpN=1+Math.floor(rnd()*2*t);lr.cmp={req,hv:Math.floor(rnd()*2),hs:Math.max(2,req-Math.floor(rnd()*2)),cv:2+Math.floor(rnd()*3),cs:Math.floor(rnd()*2),mv:'offline',ms:'offline'};lr.cmpC=p(.8)?0:1;lr.cmpW=p(t)?'笼统版都是“春天真美”这样的话，具体版写到了桃花和燕子。':'';}
 const im={};if(p(.35+t*.6)){im.th=p(.75+t*.2)?'壮':pk(['乡','别']);im.kw=KW.filter(()=>p(.3+t*.3));im.md=MD.filter(m=>p(m[1]?.3+t*.4:.15)).map(m=>m[0]);im.t='《庐山瀑布》\n'+pk(IMIT).join('\n');im.m='offline';im.n=1;im.form={ok:1,bw:Math.floor(rnd()*3),same:30+Math.floor(rnd()*30)};
  if(p(.4+t*.55)){const r5=()=>Math.max(1,Math.min(5,Math.round(rnd()*2+3)));im.r={li:{q:p(.8)?5:4,x:p(.8)?5:4,e:r5()},ai:{q:r5()-1||1,x:Math.max(1,r5()-2),e:Math.max(1,r5()-2)}};}
  im.f=[0,1,2,3].filter(()=>p(.3+t*.4));im.why=p(t)?pk(['AI 也写了银河，但是是照搬李白的，没有李白那种惊讶的感觉。','AI 的诗字数押韵都对，可是读起来没有“飞流直下三千尺”那么震撼。']):'';im.move=p(t)?'不能完全打动我，因为它没有真的看过瀑布。':'';}
 lr.im=im;
 const w={v:{},why:{},wt:{},rev:{},o:{}};WALL.forEach(pp=>{if(p(.35+t*.6)){const cBias=pp.id==='rain'?.45+t*.3:.6+t*.3;w.v[pp.id]=p(cBias)?'c':'a';w.rev[pp.id]=1;w.why[pp.id]=w.v[pp.id]==='c'?[pk([0,1,2,3])]:[pk([4,5,6])];if(p(t))w.wt[pp.id]=w.v[pp.id]==='c'?'能感觉到诗人当时的心情。':'这首词语很漂亮。';}});
 if(p(.3+t*.6)){w.st=p(.6+t*.35)?pk(['some','no']):'yes';w.stFirst=p(.85)?w.st:'yes';w.sw=p(t)?pk(['AI 的诗格式都对，但是没有自己的经历，所以不太打动人。','有时候 AI 的诗也挺好听的，但经典诗里有作者真的感受。']):'';}lr.wall=w;
 if(p(.25+t*.65)){const nw=Math.min(0.9,Math.max(0.02,rnd()*0.4+t*0.5-0.1));lr.fin={base:'《春天的阳光》\n阳光伸出金色的手指',text:'《春天的阳光》\n阳光伸出金色的手指',title:pk(['窗台上的春天','放学路上','风筝和我','桃花开了']),note:p(t)?'前两行是 AI 写的，后面我加上了放学路上看到的桃花，因为那是我真的看到的。':'改了几个字。',m:'offline',srcN:'诗词工坊 第 2 版',nw:Math.round(nw*100)/100,ratio:Math.round(Math.min(1,nw*1.1)*100)/100,how:[0,1,2].filter(()=>p(.2+t*.6)),label:p(.4+t*.55)?1:0,saved:Date.now()};}
 const q=(id,pp)=>{const ok=p(pp);const a=QUIZ.find(x=>x.id===id).a;return {first:ok?a:(a+1)%4,ok,last:a};};
 if(p(.3+t*.7))lr.quiz={q1:q('q1',.65+t*.35),q2:q('q2',.6+t*.4),q3:q('q3',.6+t*.4),q4:q('q4',.5+t*.45),q5:q('q5',.65+t*.35)};
 if(p(.2+t*.7))lr.diary={rely:p(t+.1)?'不能完全依赖，AI 写的诗没有真实的感受，核心的想法要自己来。':'不能。',assist:p(t)?'让 AI 给我提供词语、比喻的例子，帮我检查押韵，最后自己写。':'帮我写。',appre:p(t)?'我觉得《滁州西涧》更打动我，“野渡无人舟自横”很安静，像真的站在河边。':'经典诗更好。',future:p(t)?'未来的 AI 也许能根据我拍的照片写诗，但真实的感受还是要我自己写。':'更厉害。',pledge:p(.75),submitted:p(t+.1)?1:0};
 lr.nExp=vN+(lr.cmpN||0)*2+(im.n||0)+(lr.blk.n||0);
 return lr;};
})();
