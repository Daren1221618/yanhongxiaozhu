const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Config ───────────────────────────────────────────────
const DATA_DIR = path.join(__dirname, 'data');
const CONTENT_FILE = path.join(DATA_DIR, 'content.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const SESSION_SECRET = process.env.SESSION_SECRET || 'yanhong-xiaozhu-secret-' + Date.now();

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

// ─── Middleware ────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24, httpOnly: true }
}));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// ─── Data Helpers ─────────────────────────────────────────
function readJSON(filepath) {
  if (!fs.existsSync(filepath)) return null;
  return JSON.parse(fs.readFileSync(filepath, 'utf-8'));
}

function writeJSON(filepath, data) {
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf-8');
}

// ─── Initialize Default Content ───────────────────────────
function initContent() {
  // Auto-fix: remove inline grid-template-columns from existing content.json
  if (fs.existsSync(CONTENT_FILE)) {
    let data = readJSON(CONTENT_FILE);
    let changed = false;
    if (data && data.sections) {
      for (let s of data.sections) {
        let old = s.content;
        s.content = s.content.replace(/\s*style="[^"]*grid-template-columns:\s*repeat\([^"]+\)[^"]*"/g, '');
        if (s.content !== old) changed = true;
      }
    }
    if (changed) {
      writeJSON(CONTENT_FILE, data);
      console.log('✅ 已自动移除 content.json 中的内联 grid 样式');
    }
    return;
  }

  const defaultContent = {
    site: {
      name: '嫣红小主',
      subtitle: '花果茶鲜酿',
      tagline: '东方风雅，微醺悦己。',
      description: '嫣红小主是一家以"东方微醺美学"为核心的国风花果茶鲜酿品牌。',
      logo: '嫣红小主',
      footerText: '© 2026 嫣红小主 · 花果茶鲜酿。保留所有权利。'
    },
    sections: [
      {
        id: 'hero',
        order: 1,
        title: '公司宗旨',
        subtitle: '东方微醺美学',
        navLabel: '公司宗旨',
        content: `<div class="hero-inner">
          <div class="hero-badge">嫣红小主 · 花果茶鲜酿</div>
          <h1 class="hero-title">寻得姹紫嫣红<br>酿作人间微醺</h1>
          <p class="hero-desc">嫣红小主 = 东方花果茶 × 精酿工艺 × 国风美学<br>不是传统啤酒，不是普通果酒，是"可以喝的东方美学"。</p>
          <div class="hero-tags">
            <span>东方花果茶鲜酿</span>
            <span>真花真果真茶</span>
            <span>东方鲜酿</span>
          </div>
        </div>`
      },
      {
        id: 'pain-points',
        order: 2,
        title: '痛点需求',
        subtitle: '用户是谁，解决什么问题',
        navLabel: '痛点需求',
        content: `<div class="section-intro">
          <p class="intro-text"><strong>核心用户：</strong>20-35岁城市年轻女性，追求生活美学、热爱传统文化、乐于打卡分享的"新国风女孩"。</p>
        </div>
        <div class="pain-grid">
          <div class="pain-card">
            <div class="pain-icon">01</div>
            <h3>精酿啤酒"去苦趋甜"的需求未被满足</h3>
            <p>传统精酿以苦味和酒花风味为主导，对女性及年轻消费者不够友好。新中式增味精酿已成为市场热点，但花果茶鲜酿这一细分品类尚无代表性品牌。</p>
          </div>
          <div class="pain-card">
            <div class="pain-icon">02</div>
            <h3>女性酒饮市场供给端严重滞后</h3>
            <p>女性酒类消费占比首次突破50%，低度潮饮赛道女性消费者达61%。但针对女性审美与口感需求的国风酒饮品牌仍然稀缺。</p>
          </div>
          <div class="pain-card">
            <div class="pain-icon">03</div>
            <h3>消费场景从"应酬"转向"悦己"</h3>
            <p>酒饮场景正从传统应酬酒局，转向居家独酌、闺蜜小聚、露营微醺等悦己导向的生活时刻，缺乏兼具仪式感与轻松感的中高端选择。</p>
          </div>
          <div class="pain-card">
            <div class="pain-icon">04</div>
            <h3>国风美学+新酒饮的品牌空白</h3>
            <p>茶颜悦色证明了"国风茶饮"的千亿市场，霸王茶姬验证了"东方茶饮"的文化IP价值，但在"国风+酒饮"赛道尚无头部品牌。</p>
          </div>
        </div>
        <blockquote class="highlight-quote">市场上不缺酒，缺的是"一杯有东方美学的微醺"——既是精酿的品质，又是花果茶的香甜，还是国风的颜值，更是悦己的仪式。</blockquote>`
      },
      {
        id: 'solution',
        order: 3,
        title: '解决方案',
        subtitle: '提供什么服务，有什么价值',
        navLabel: '解决方案',
        content: `<div class="section-intro">
          <p class="intro-text">嫣红小主构建<strong>18款产品</strong>的双轮驱动结构，实现"男女通吃、全天候经营"。</p>
        </div>
        <div class="dual-drive">
          <div class="drive-col drive-traditional">
            <div class="drive-header">
              <h3>传统精酿</h3>
              <span class="drive-percent">40% · 约7款</span>
              <span class="drive-target">面向男性精酿爱好者</span>
            </div>
            <div class="drive-items">
              <div class="drive-item"><span class="drive-dot"></span>德式小麦 · 经典德式小麦</div>
              <div class="drive-item"><span class="drive-dot"></span>比利时小麦 · 比利时白啤</div>
              <div class="drive-item"><span class="drive-dot"></span>IPA · 美式IPA / 浑浊IPA</div>
              <div class="drive-item"><span class="drive-dot"></span>修道院 · 比利时双料 / 三料</div>
              <div class="drive-item"><span class="drive-dot"></span>世涛 / 波特等</div>
            </div>
          </div>
          <div class="drive-col drive-floral">
            <div class="drive-header">
              <h3>花果茶鲜酿</h3>
              <span class="drive-percent">60% · 约11款</span>
              <span class="drive-target">面向女性核心用户</span>
            </div>
            <div class="drive-items">
              <div class="drive-item"><span class="drive-dot"></span>零度无醇 · 原味无醇 — 0酒精，畅饮无负担</div>
              <div class="drive-item"><span class="drive-dot"></span>花果系列 · 荔枝海盐、茉莉青柠 — 花香果香融合</div>
              <div class="drive-item"><span class="drive-dot"></span>果味系列 · 蓝莓、百香果 — 鲜果入酿，清甜爽口</div>
              <div class="drive-item"><span class="drive-dot"></span>茶酿系列 · 乌龙柠檬、西柚茉莉 — 茶香酒香交织</div>
            </div>
          </div>
        </div>
        <div class="values-grid">
          <div class="value-card"><h4>真花真果真茶</h4><p>严选当季花果与茶叶，不添加香精色素，每一口都是自然本真味道。</p></div>
          <div class="value-card"><h4>双轮驱动</h4><p>40%传统精酿留住男性客群，60%花果茶鲜酿吸引女性核心用户。</p></div>
          <div class="value-card"><h4>低度微醺</h4><p>酒精度覆盖0%-5%，既有无醇选项，也有恰到好处的微醺感。</p></div>
          <div class="value-card"><h4>国风颜值</h4><p>每一瓶都是一件东方美学小物，满足年轻女性的打卡分享需求。</p></div>
          <div class="value-card"><h4>文创内核</h4><p>每款产品对应一个国风意象、一段文化故事，杯中有故事。</p></div>
        </div>
        <blockquote class="highlight-quote">用精酿的工艺做花果茶酒，用国风的美学做品牌体验——让男人喝到品质，让女人喝到风雅。</blockquote>`
      },
      {
        id: 'market-timing',
        order: 4,
        title: '市场时机',
        subtitle: '为什么是现在？五重红利叠加',
        navLabel: '市场时机',
        content: `<div class="timing-list">
          <div class="timing-item">
            <div class="timing-num">01</div>
            <div class="timing-body">
              <h3>精酿啤酒市场爆发式增长</h3>
              <p>2025年精酿啤酒市场规模突破1300亿元，渗透率攀升至6.3%，门店达1.66万家。精酿销售额占比从6.8%增长至17.2%。早三年市场认知不足，晚三年巨头入场——现在是入局最佳窗口。</p>
            </div>
          </div>
          <div class="timing-item">
            <div class="timing-num">02</div>
            <div class="timing-body">
              <h3>女性酒饮消费结构性变革</h3>
              <p>2025年女性酒类消费占比首破50%，低度潮饮赛道女性消费者达61%。果酒年增速72%，茶酒65%，气泡酒210%。"她力量"正在重塑中国酒业未来版图。</p>
            </div>
          </div>
          <div class="timing-item">
            <div class="timing-num">03</div>
            <div class="timing-body">
              <h3>新酒饮赛道千亿市场形成</h3>
              <p>低度酒行业市场规模达1119亿元，年复合增长率25%。汾酒、五粮液等巨头纷纷入局，但缺乏"国风美学+精酿工艺"的差异化品牌。</p>
            </div>
          </div>
          <div class="timing-item">
            <div class="timing-num">04</div>
            <div class="timing-body">
              <h3>加盟扩张模式已被验证</h3>
              <p>泰山原浆3074家门店、优布劳1924家覆盖296城、鲜啤福鹿家1800+家。精酿加盟模式成熟，市场对优质品牌有明确的并购退出预期。</p>
            </div>
          </div>
          <div class="timing-item">
            <div class="timing-num">05</div>
            <div class="timing-body">
              <h3>贵州、湖南政策支持</h3>
              <p>贵阳市成立精酿啤酒行业协会，将精酿纳入重点产业规划；贵阳精酿搜索量上涨657.6%。湖南现存148家精酿企业，逐年稳步上升。</p>
            </div>
          </div>
        </div>
        <blockquote class="highlight-quote">精酿爆发+女性崛起+新酒饮千亿+加盟模式成熟+黔湘政策加持——五重红利叠加，现在是入局的最佳时间窗口。</blockquote>`
      },
      {
        id: 'market-potential',
        order: 5,
        title: '市场潜力',
        subtitle: '市场规模与增长空间',
        navLabel: '市场潜力',
        content: `<div class="stats-section">
          <div class="stats-row">
            <div class="stat-card"><div class="stat-value">1300<span>亿元</span></div><div class="stat-label">2025精酿市场规模</div></div>
            <div class="stat-card"><div class="stat-value">1119<span>亿元</span></div><div class="stat-label">低度酒行业规模</div></div>
            <div class="stat-card"><div class="stat-value">740<span>亿元</span></div><div class="stat-label">女性低度酒饮市场</div></div>
            <div class="stat-card"><div class="stat-value">30%<span>+</span></div><div class="stat-label">年复合增长率</div></div>
          </div>
        </div>
        <div class="case-studies">
          <h3>新茶饮跨界验证</h3>
          <div class="case-grid">
            <div class="case-card"><strong>茶颜悦色</strong><p>门店700+家，估值超百亿</p><span>国风美学×新式饮品</span></div>
            <div class="case-card"><strong>霸王茶姬</strong><p>门店超5000家，年营收破百亿</p><span>东方文化IP×连锁模式</span></div>
            <div class="case-card"><strong>花西子</strong><p>年GMV超50亿</p><span>东方美学×女性消费者</span></div>
          </div>
        </div>
        <div class="market-path">
          <h3>门店扩张路径</h3>
          <div class="path-steps">
            <div class="path-step"><span class="step-year">第1年</span><strong>3家直营</strong><p>模型验证</p></div>
            <div class="path-arrow">→</div>
            <div class="path-step"><span class="step-year">第3年</span><strong>300家</strong><p>20直营+280加盟</p></div>
            <div class="path-arrow">→</div>
            <div class="path-step highlight"><span class="step-year">第5年</span><strong>800家</strong><p>100直营+700加盟</p></div>
          </div>
          <p class="path-note">长期可做到年营收数亿、估值数十亿的国风鲜酿品牌</p>
        </div>`
      },
      {
        id: 'competition',
        order: 6,
        title: '竞争情况',
        subtitle: '差异化竞争优势分析',
        navLabel: '竞争情况',
        content: `<div class="comp-grid">
          <div class="comp-card advantage">
            <h3>品类开创者</h3>
            <p>"东方花果茶鲜酿"定义者——用精酿工艺做花果茶酒，用国风美学做品牌体验，开创全新品类。</p>
          </div>
          <div class="comp-card advantage">
            <h3>双轮驱动</h3>
            <p>纯女性向品牌难以吸引男性消费者，纯精酿难以打动女性。嫣红小主40%+60%实现男女通吃。</p>
          </div>
          <div class="comp-card advantage">
            <h3>东方美学系统化</h3>
            <p>从品牌名到产品名、视觉、文案、空间到文创，全链路贯彻"东方微醺美学"，形成完整品牌资产壁垒。</p>
          </div>
          <div class="comp-card advantage">
            <h3>文创第二曲线</h3>
            <p>「小主雅物」「嫣红十二席」「小主典藏」三大文创产品线，形成"卖酒+卖文创"双引擎盈利模式。</p>
          </div>
          <div class="comp-card advantage">
            <h3>低度微醺+健康化</h3>
            <p>产品线覆盖0%-5%酒精度，精准卡位"健康化、轻松化饮酒趋势"。</p>
          </div>
          <div class="comp-card advantage">
            <h3>区域聚焦策略</h3>
            <p>前3年聚焦贵州、湖南两省，利用政策红利和文化认同，做深做透后再向外复制。</p>
          </div>
        </div>
        <blockquote class="highlight-quote">传统精酿不够"美"，果酒不够"酿"，茶饮不够"酒"——嫣红小主是"既有精酿品质、又有花果茶香甜、还有国风美学"的新物种。</blockquote>
        <div class="comp-barriers">
          <h3>六大竞争壁垒</h3>
          <div class="barrier-tags">
            <span>品牌资产壁垒</span><span>产品研发壁垒</span><span>供应链壁垒</span>
            <span>文化IP壁垒</span><span>先发优势壁垒</span><span>区域壁垒</span>
          </div>
        </div>`
      },
      {
        id: 'business-model',
        order: 7,
        title: '商业模式',
        subtitle: '三层盈利模型与扩张路径',
        navLabel: '商业模式',
        content: `<div class="model-tiers">
          <div class="model-tier">
            <div class="tier-label">收入一</div>
            <h3>直营门店销售 <span>短期核心</span></h3>
            <div class="tier-details">
              <p>3家直营门店验证模型，3年内拓展至20家直营门店。堂食鲜酿毛利率65-75%，瓶装零售50-60%。</p>
              <div class="tier-metrics">
                <span>客单价 60-120元</span>
                <span>月营收 15-30万/店</span>
                <span>年营收 180-360万/店</span>
              </div>
            </div>
          </div>
          <div class="model-tier">
            <div class="tier-label">收入二</div>
            <h3>加盟业务 <span>中期扩张</span></h3>
            <div class="tier-details">
              <p>加盟费15-30万元/店，品牌管理费营收3-5%，供应链利润10-15%。3年目标：280家加盟店。</p>
              <div class="tier-metrics">
                <span>加盟费 4200-8400万</span>
                <span>年管理费 1500-5000万</span>
              </div>
            </div>
          </div>
          <div class="model-tier">
            <div class="tier-label">收入三</div>
            <h3>文创衍生品 <span>长期增长</span></h3>
            <div class="tier-details">
              <p>线上商城（小程序、小红书店铺）+ 门店文创区零售 + 礼盒定制/企业采购。三大文创产品线覆盖29-999元价格带。</p>
            </div>
          </div>
        </div>
        <blockquote class="highlight-quote">"前端卖酒赚流水，中端卖加盟赚规模，后端卖文创赚品牌"——三层盈利模型，确保短期现金流+中期扩张+长期品牌价值。</blockquote>`
      },
      {
        id: 'team',
        order: 8,
        title: '核心团队',
        subtitle: '从0到1打造国风鲜酿品牌的系统能力',
        navLabel: '核心团队',
        content: `<div class="team-assets">
          <div class="asset-card"><h3>品牌资产 <span>30万</span></h3><ul><li>"嫣红小主"商标所有权</li><li>完整品牌视觉识别系统</li><li>品牌话语体系</li><li>"嫣红十二钗"原创IP</li></ul></div>
          <div class="asset-card"><h3>商业模式 <span>30万</span></h3><ul><li>18款完整产品矩阵</li><li>三大文创产品线</li><li>门店空间体验设计</li><li>加盟模式与扩张路径</li></ul></div>
          <div class="asset-card"><h3>三方服务 <span>30万</span></h3><ul><li>品牌策划与设计</li><li>产品研发与技术配方</li><li>供应链资源对接</li><li>新媒体内容运营</li></ul></div>
        </div>
        <blockquote class="highlight-quote">团队提供的不只是"开一家酒馆"的能力，而是"从0到1打造一个国风鲜酿品牌"的系统能力——品牌、产品、设计、运营、传播，五位一体。</blockquote>`
      },
      {
        id: 'financial-plan',
        order: 9,
        title: '财务计划',
        subtitle: '融资方案与投资回报',
        navLabel: '财务计划',
        content: `<div class="finance-overview">
          <div class="finance-hero">
            <div class="finance-card main"><span class="fc-label">项目总估值</span><span class="fc-value">150<span>万元</span></span></div>
            <div class="finance-card"><span class="fc-label">开放融资比例</span><span class="fc-value">20%</span></div>
            <div class="finance-card accent"><span class="fc-label">本轮融资额</span><span class="fc-value">30<span>万元</span></span></div>
          </div>
          <div class="fund-usage">
            <h3>资金用途</h3>
            <div class="usage-bars">
              <div class="usage-bar"><span class="ub-label">三家直营门店开设</span><span class="ub-value">18万 · 60%</span><div class="ub-track"><div class="ub-fill" style="width:60%"></div></div></div>
              <div class="usage-bar"><span class="ub-label">产品研发与生产</span><span class="ub-value">5万 · 17%</span><div class="ub-track"><div class="ub-fill" style="width:17%"></div></div></div>
              <div class="usage-bar"><span class="ub-label">品牌营销推广</span><span class="ub-value">4万 · 13%</span><div class="ub-track"><div class="ub-fill" style="width:13%"></div></div></div>
              <div class="usage-bar"><span class="ub-label">运营流动资金</span><span class="ub-value">3万 · 10%</span><div class="ub-track"><div class="ub-fill" style="width:10%"></div></div></div>
            </div>
          </div>
          <div class="roi-section">
            <h3>投资回报</h3>
            <div class="roi-cards">
              <div class="roi-card"><span>本轮估值</span><strong>150万</strong></div>
              <div class="roi-card"><span>投资额</span><strong>30万（20%）</strong></div>
              <div class="roi-card highlight"><span>3年估值预期</span><strong>5000万-1亿</strong></div>
              <div class="roi-card highlight"><span>5年估值预期</span><strong>10-20亿</strong></div>
              <div class="roi-card"><span>回报倍数</span><strong>16-66倍</strong></div>
            </div>
          </div>
        </div>`
      },
      {
        id: 'vision',
        order: 10,
        title: '企业愿景',
        subtitle: '三五年后，让嫣红小主成为东方微醺美学的代名词',
        navLabel: '企业愿景',
        content: `<div class="vision-timeline">
          <div class="vision-phase">
            <div class="vp-header"><h3>3年目标</h3><span>2026-2029</span></div>
            <div class="vp-goals">
              <div class="vp-goal">✅ 3家直营门店模型验证</div>
              <div class="vp-goal">✅ 直营20家+加盟280家=300家总门店</div>
              <div class="vp-goal">✅ 覆盖贵州、湖南两省</div>
              <div class="vp-goal">✅ 18款产品全线上市，"桃之夭夭"成为超级单品</div>
              <div class="vp-goal">✅ 文创产品线贡献营收占比20%+</div>
              <div class="vp-goal accent">🎯 启动A轮融资，估值5000万-1亿元</div>
            </div>
          </div>
          <div class="vision-phase highlight">
            <div class="vp-header"><h3>5年愿景</h3><span>2026-2031</span></div>
            <div class="vp-goals">
              <div class="vp-goal">🏆 全国800+门店（100直营+700加盟）</div>
              <div class="vp-goal">🏆 覆盖7省市（黔、湘、赣、滇、粤、沪、桂）</div>
              <div class="vp-goal">🏆 年营收突破2-5亿元</div>
              <div class="vp-goal">🏆 成为"国风酒饮第一品牌"</div>
              <div class="vp-goal accent">🎯 估值10-20亿元，启动B轮或品牌并购</div>
            </div>
          </div>
        </div>
        <blockquote class="highlight-quote ultimate">让"嫣红小主"成为东方花果茶鲜酿的代名词——不是做一家赚钱的酒馆，而是做一个有文化根基、有品牌壁垒、有品类话语权的国风鲜酿品牌。</blockquote>`
      },
      {
        id: 'appendix',
        order: 11,
        title: '附录',
        subtitle: '品牌信息速查',
        navLabel: '附录',
        content: `<div class="appendix-table">
          <div class="ap-row"><span class="ap-key">品牌名</span><span class="ap-val">嫣红小主</span></div>
          <div class="ap-row"><span class="ap-key">品牌亮点</span><span class="ap-val">东方微醺美学</span></div>
          <div class="ap-row"><span class="ap-key">品牌定位</span><span class="ap-val">东方花果茶鲜酿</span></div>
          <div class="ap-row"><span class="ap-key">品牌品类</span><span class="ap-val">果茶鲜酿</span></div>
          <div class="ap-row"><span class="ap-key">核心价值</span><span class="ap-val">真花真果真茶，东方鲜酿</span></div>
          <div class="ap-row"><span class="ap-key">主广告语</span><span class="ap-val">东方风雅，微醺悦己。</span></div>
          <div class="ap-row"><span class="ap-key">产品诠释</span><span class="ap-val">寻得姹紫嫣红，酿作人间微醺。</span></div>
          <div class="ap-row"><span class="ap-key">竞争区隔</span><span class="ap-val">奶茶是白天的糖，嫣红是夜晚的诗。</span></div>
          <div class="ap-row"><span class="ap-key">产品结构</span><span class="ap-val">18款（40%传统精酿+60%花果茶鲜酿）</span></div>
          <div class="ap-row"><span class="ap-key">项目估值</span><span class="ap-val">150万元</span></div>
          <div class="ap-row"><span class="ap-key">融资额</span><span class="ap-val">30万元（占股20%）</span></div>
        </div>`
      }
    ]
  };

  writeJSON(CONTENT_FILE, defaultContent);
}

// ─── Initialize Default Admin User ────────────────────────
function initUsers() {
  if (fs.existsSync(USERS_FILE)) return;
  const defaultAdmin = {
    username: 'admin',
    passwordHash: bcrypt.hashSync('yanhong2026', 10),
    createdAt: new Date().toISOString()
  };
  writeJSON(USERS_FILE, { users: [defaultAdmin] });
}

// ─── Auth Middleware ───────────────────────────────────────
function requireAuth(req, res, next) {
  if (req.session && req.session.authenticated) {
    return next();
  }
  res.status(401).json({ error: '未授权访问' });
}

// ─── API Routes ───────────────────────────────────────────

// Get all sections
app.get('/api/sections', (req, res) => {
  const data = readJSON(CONTENT_FILE);
  if (!data) return res.status(500).json({ error: '内容数据不存在' });
  res.json(data);
});

// Get single section
app.get('/api/sections/:id', (req, res) => {
  const data = readJSON(CONTENT_FILE);
  if (!data) return res.status(500).json({ error: '内容数据不存在' });
  const section = data.sections.find(s => s.id === req.params.id);
  if (!section) return res.status(404).json({ error: '未找到该章节' });
  res.json(section);
});

// Update section (admin only)
app.put('/api/sections/:id', requireAuth, (req, res) => {
  const data = readJSON(CONTENT_FILE);
  if (!data) return res.status(500).json({ error: '内容数据不存在' });

  const index = data.sections.findIndex(s => s.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: '未找到该章节' });

  const allowedFields = ['title', 'subtitle', 'navLabel', 'content'];
  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      data.sections[index][field] = req.body[field];
    }
  });
  data.sections[index].updatedAt = new Date().toISOString();

  writeJSON(CONTENT_FILE, data);
  res.json({ success: true, section: data.sections[index] });
});

// Reorder sections (admin only)
app.put('/api/sections/reorder', requireAuth, (req, res) => {
  const { orderedIds } = req.body;
  if (!Array.isArray(orderedIds)) {
    return res.status(400).json({ error: 'orderedIds 必须是数组' });
  }
  const data = readJSON(CONTENT_FILE);
  if (!data) return res.status(500).json({ error: '内容数据不存在' });

  const sectionMap = {};
  data.sections.forEach(s => { sectionMap[s.id] = s; });

  // Filter to only IDs that exist in current data (graceful mismatch)
  const validIds = orderedIds.filter(id => sectionMap[id]);
  const missingIds = orderedIds.filter(id => !sectionMap[id]);
  
  // Keep unmoved sections at their current position
  const remainingIds = data.sections.map(s => s.id).filter(id => !validIds.includes(id));

  if (validIds.length === 0) {
    return res.status(400).json({ error: '没有有效的章节ID' });
  }

  // Build reordered list: validIds in new order, then remaining in original order
  const reordered = [];
  for (const id of validIds) {
    const s = sectionMap[id];
    s.order = reordered.length + 1;
    reordered.push(s);
  }
  for (const id of remainingIds) {
    const s = sectionMap[id];
    s.order = reordered.length + 1;
    reordered.push(s);
  }
  
  data.sections = reordered;
  data.sections.forEach(s => { s.updatedAt = new Date().toISOString(); });

  writeJSON(CONTENT_FILE, data);
  res.json({ success: true, sections: data.sections, 
    note: missingIds.length ? `已忽略 ${missingIds.length} 个不匹配的ID` : undefined 
  });
});

// Update site settings (admin only)
app.put('/api/site', requireAuth, (req, res) => {
  const data = readJSON(CONTENT_FILE);
  if (!data) return res.status(500).json({ error: '内容数据不存在' });

  const allowedFields = ['name', 'subtitle', 'tagline', 'description', 'logo', 'logoType', 'logoUrl', 'footerText'];
  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      data.site[field] = req.body[field];
    }
  });

  writeJSON(CONTENT_FILE, data);
  res.json({ success: true, site: data.site });
});

// Login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const userData = readJSON(USERS_FILE);
  if (!userData) return res.status(500).json({ error: '用户数据不存在' });

  const user = userData.users.find(u => u.username === username);
  if (!user) return res.status(401).json({ error: '用户名或密码错误' });

  const valid = bcrypt.compareSync(password, user.passwordHash);
  if (!valid) return res.status(401).json({ error: '用户名或密码错误' });

  req.session.authenticated = true;
  req.session.username = username;
  res.json({ success: true, username });
});

// Logout
app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

// Check auth
app.get('/api/check-auth', (req, res) => {
  res.json({ authenticated: !!req.session.authenticated, username: req.session.username || null });
});

// Change password (admin only)
app.post('/api/change-password', requireAuth, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userData = readJSON(USERS_FILE);
  const user = userData.users[0];

  if (!bcrypt.compareSync(currentPassword, user.passwordHash)) {
    return res.status(400).json({ error: '当前密码错误' });
  }

  user.passwordHash = bcrypt.hashSync(newPassword, 10);
  writeJSON(USERS_FILE, userData);
  res.json({ success: true });
});

// Admin redirect
app.get(['/admin', '/admin/'], (req, res) => {
  res.redirect('/admin/login.html');
});

// SPA fallback - serve index.html for non-API routes
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API不存在' });
  }
  // Don't catch admin routes
  if (req.path.startsWith('/admin/')) {
    return res.status(404).send('404 - 管理页面不存在');
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ─── Start Server ─────────────────────────────────────────
initContent();
initUsers();

app.listen(PORT, () => {
  console.log(`🌸 嫣红小主服务器已启动: http://localhost:${PORT}`);
  console.log(`   管理后台: http://localhost:${PORT}/admin/`);
  console.log(`   默认账号: admin / yanhong2026`);
});
