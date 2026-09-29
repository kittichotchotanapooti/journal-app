(function(){
  "use strict";

  var ICONS = {
    reflect: '<path d="M12 3a9 9 0 1 0 9 9 7 7 0 0 1-9-9Z"/>',
    idea: '<path d="M12 2.5v3.2M12 18.3v3.2M5 5l2.3 2.3M16.7 16.7 19 19M2.5 12h3.2M18.3 12h3.2M5 19l2.3-2.3M16.7 7.3 19 5"/>',
    thought: '<path d="M12 20a8 8 0 1 1 8-8 6 6 0 0 1-6 6 4 4 0 0 1-4-4 2 2 0 0 1 2-2"/>',
    today: '<circle cx="12" cy="12" r="9"/><path d="M8 12.4l2.6 2.6L16 9.4"/>',
    health: '<path d="M3 12h3.4l1.8-5 3.4 10 1.8-5H21"/>',
    review: '<path d="M4 6.5h16M4 12h16M4 17.5h10"/>',
    back: '<path d="M14.5 5 8 11.5l6.5 6.5" stroke-linecap="round" stroke-linejoin="round"/>',
    export: '<path d="M12 3v11.5M8 10l4 4 4-4M5 19h14" stroke-linecap="round" stroke-linejoin="round"/>'
  };
  function icon(name){
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">' + ICONS[name] + '</svg>';
  }

  var REFLECT_FIELDS = [
    {key:'developed', q:'สิ่งที่เราพัฒนาขึ้น เกิดอะไรขึ้นบ้างในวันนี้ที่เราได้พัฒนาขึ้น'},
    {key:'lacking', q:'สิ่งที่เรารู้สึกขาดตกบกพร่อง สิ่งที่เรารู้สึกขาดหาย หรือยังไม่ได้ทำ (ทำให้รู้สึกเสียดาย)'},
    {key:'improve', q:'สิ่งที่เรารู้ตัว และจะปรับปรุงแก้ไข จะแก้ไขยังไง ลองบอกตัวเองวันพรุ่งนี้หน่อย :)'},
    {key:'unkind', q:'ใครใจร้ายกับเราบ้าง เพราะอะไร'},
    {key:'kind', q:'ใครใจดีกับเราบ้าง :))'},
    {key:'favorite', q:'วันนี้เราชอบอะไรที่สุด'},
    {key:'tomorrow', q:'พรุ่งนี้ เราจะทำอะไร (แค่พรุ่งนี้ 3 สิ่งสำคัญที่จะทำให้สำเร็จ)'},
    {key:'grateful', q:'รู้สึกขอบคุณอะไรในวันนี้'}
  ];

  var SINGLE = {
    idea: {label:'ไอเดียที่ผุดขึ้นมา', q:'ไหน คุณมีไอเดียอย่างไร ?'},
    thought: {label:'ความคิด', q:'ความคิดเป็นสิ่งที่เกิดขึ้นได้เป็นธรรมชาติ เราชนะมันได้ด้วยการรู้ทัน ความคิดนั้นบอกคุณว่าอะไร ?'},
    health: {label:'สุขภาพ', q:'ยืนบนไหล่ยักษ์'}
  };

  var MODES = [
    {key:'reflect', label:'สะท้อนตัวเอง', desc:'ทบทวนวันนี้ผ่าน 8 คำถาม', icon:'reflect'},
    {key:'idea', label:'ไอเดียที่ผุดขึ้นมา', desc:'จับไอเดียไว้ก่อนมันหายไป', icon:'idea'},
    {key:'thought', label:'ความคิด', desc:'รู้ทันความคิดที่ผ่านเข้ามา', icon:'thought'},
    {key:'today', label:'งานวันนี้ & พัฒนา', desc:'3 สิ่งสำคัญของวันนี้', icon:'today'},
    {key:'health', label:'สุขภาพ', desc:'ยืนบนไหล่ยักษ์', icon:'health'},
    {key:'review', label:'ย้อนดูบันทึก', desc:'ดูประวัติทั้งหมดที่ผ่านมา', icon:'review'}
  ];

  var REVIEW_LABELS = {reflect:'สะท้อนตัวเอง', idea:'ไอเดีย', thought:'ความคิด', health:'สุขภาพ'};

  var THAI_MONTHS = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
  function fmtDate(ts){ var d=new Date(ts); return d.getDate()+' '+THAI_MONTHS[d.getMonth()]+' '+(d.getFullYear()+543); }
  function fmtTime(ts){ var d=new Date(ts); return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0'); }
  function esc(s){ return (s==null?'':String(s)).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function uid(){ return Date.now().toString(36)+Math.random().toString(36).slice(2,8); }

  function loadEntries(mode){
    try{ var v = JSON.parse(localStorage.getItem('jrnl_'+mode) || '[]'); return Array.isArray(v)?v:[]; }
    catch(e){ return []; }
  }
  function saveEntries(mode, arr){
    try{ localStorage.setItem('jrnl_'+mode, JSON.stringify(arr)); }catch(e){}
  }
  function addEntry(mode, data){
    var arr = loadEntries(mode);
    arr.unshift(Object.assign({id:uid(), ts:Date.now()}, data));
    saveEntries(mode, arr);
  }
  function deleteEntry(mode, id){
    var arr = loadEntries(mode).filter(function(e){ return e.id !== id; });
    saveEntries(mode, arr);
  }
  function previewOf(mode, entry){
    if (mode === 'reflect'){
      return REFLECT_FIELDS.map(function(f){ return entry[f.key]||''; }).filter(Boolean).join(' ');
    }
    return entry.text || '';
  }

  var toastTimer = null;
  function toast(msg){
    var el = document.getElementById('toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function(){ el.classList.remove('show'); }, 1800);
  }

  // --- navigation ---
  var navStack = [];
  var route = {screen:'home'};
  function nav(screen, params){
    navStack.push(route);
    route = Object.assign({screen:screen}, params||{});
    render();
  }
  function back(){
    route = navStack.pop() || {screen:'home'};
    render();
  }

  var app = document.getElementById('app');

  function backBtnHtml(){
    return '<button class="back-btn" id="backBtn" aria-label="ย้อนกลับ">'+icon('back')+'</button>';
  }

  function render(){
    var scr = route.screen;
    if (scr === 'home') return renderHome();
    if (scr === 'single') return renderSingle(route.mode);
    if (scr === 'reflect') return renderReflect();
    if (scr === 'today') return renderToday();
    if (scr === 'reviewCats') return renderReviewCats();
    if (scr === 'reviewList') return renderReviewList(route.mode);
    if (scr === 'reviewDetail') return renderReviewDetail(route.mode, route.id);
    renderHome();
  }

  function renderHome(){
    var html = '';
    html += '<div class="topbar"><span class="brand">เงาสะท้อน</span>';
    html += '<button class="icon-btn" id="exportBtn" aria-label="สำรองข้อมูล">'+icon('export')+'</button></div>';
    html += '<div class="hero"><h1>เงาสะท้อน</h1><p>จดบันทึกไว้กับตัวเอง วันละนิด</p></div>';
    html += '<div class="mode-list">';
    MODES.forEach(function(m){
      html += '<button class="mode-card" data-mode="'+m.key+'">'+
        '<span class="mode-mark">'+icon(m.icon)+'</span>'+
        '<span class="mode-text"><strong>'+esc(m.label)+'</strong><span>'+esc(m.desc)+'</span></span>'+
        '</button>';
    });
    html += '</div>';
    app.innerHTML = html;

    app.querySelectorAll('.mode-card').forEach(function(btn){
      btn.addEventListener('click', function(){
        var mode = btn.getAttribute('data-mode');
        if (mode === 'reflect') nav('reflect');
        else if (mode === 'today') nav('today');
        else if (mode === 'review') nav('reviewCats');
        else nav('single', {mode: mode});
      });
    });
    document.getElementById('exportBtn').addEventListener('click', openExportSheet);
  }

  function renderSingle(mode){
    var meta = SINGLE[mode];
    var html = '<div class="screen">';
    html += '<div class="screen-header">'+backBtnHtml()+'<span class="screen-title">'+esc(meta.label)+'</span></div>';
    html += '<div class="screen-body"><p class="prompt">'+esc(meta.q)+'</p>';
    html += '<textarea id="singleText" placeholder="เขียนที่นี่..."></textarea></div>';
    html += '<div class="hint" id="singleHint"></div>';
    html += '<div class="screen-footer"><button class="btn-primary" id="saveSingle">บันทึก</button></div>';
    html += '</div>';
    app.innerHTML = html;

    document.getElementById('backBtn').addEventListener('click', back);
    document.getElementById('saveSingle').addEventListener('click', function(){
      var ta = document.getElementById('singleText');
      var text = ta.value.trim();
      if (!text){
        document.getElementById('singleHint').textContent = 'เขียนอะไรสักอย่างก่อนนะ';
        return;
      }
      addEntry(mode, {text: text});
      toast('บันทึกแล้ว');
      back();
    });
  }

  function renderReflect(){
    var html = '<div class="screen">';
    html += '<div class="screen-header">'+backBtnHtml()+'<span class="screen-title">สะท้อนตัวเอง</span></div>';
    html += '<div class="screen-body">';
    REFLECT_FIELDS.forEach(function(f){
      html += '<div class="field-block"><label for="rf_'+f.key+'">'+esc(f.q)+'</label>'+
        '<textarea id="rf_'+f.key+'"></textarea></div>';
    });
    html += '</div>';
    html += '<div class="hint" id="reflectHint"></div>';
    html += '<div class="screen-footer"><button class="btn-primary" id="saveReflect">บันทึก</button></div>';
    html += '</div>';
    app.innerHTML = html;

    document.getElementById('backBtn').addEventListener('click', back);
    document.getElementById('saveReflect').addEventListener('click', function(){
      var data = {};
      var any = false;
      REFLECT_FIELDS.forEach(function(f){
        var v = document.getElementById('rf_'+f.key).value.trim();
        data[f.key] = v;
        if (v) any = true;
      });
      if (!any){
        document.getElementById('reflectHint').textContent = 'เขียนอะไรสักอย่างก่อนนะ';
        return;
      }
      addEntry('reflect', data);
      toast('บันทึกแล้ว');
      back();
    });
  }

  function renderToday(){
    var entries = loadEntries('reflect');
    var html = '<div class="screen">';
    html += '<div class="screen-header">'+backBtnHtml()+'<span class="screen-title">งานวันนี้ & พัฒนา</span></div>';
    if (!entries.length || !entries[0].tomorrow){
      html += '<div class="today-empty"><p>ยังไม่มีข้อมูล ลองไปเขียน "สะท้อนตัวเอง" สักครั้งก่อนนะ แล้วสิ่งที่ตั้งใจไว้สำหรับพรุ่งนี้จะมาโชว์ตรงนี้เอง</p>'+
        '<button class="btn-primary" id="goReflect" style="flex:none;padding:12px 22px;">ไปเขียน Reflect</button></div>';
    } else {
      html += '<div class="today-content">'+
        '<span class="today-date">'+fmtDate(entries[0].ts)+'</span>'+
        '<p class="today-text">'+esc(entries[0].tomorrow)+'</p>'+
        '<span class="today-mantra">คุณทำได้</span>'+
        '</div>';
    }
    html += '</div>';
    app.innerHTML = html;
    document.getElementById('backBtn').addEventListener('click', back);
    var goBtn = document.getElementById('goReflect');
    if (goBtn) goBtn.addEventListener('click', function(){ nav('reflect'); });
  }

  function renderReviewCats(){
    var html = '<div class="screen">';
    html += '<div class="screen-header">'+backBtnHtml()+'<span class="screen-title">ย้อนดูบันทึก</span></div>';
    html += '<div class="cat-grid">';
    Object.keys(REVIEW_LABELS).forEach(function(k){
      var n = loadEntries(k).length;
      html += '<button class="cat-card" data-cat="'+k+'"><strong>'+esc(REVIEW_LABELS[k])+'</strong>'+
        '<span class="cat-count">'+n+' รายการ</span></button>';
    });
    html += '</div></div>';
    app.innerHTML = html;
    document.getElementById('backBtn').addEventListener('click', back);
    app.querySelectorAll('.cat-card').forEach(function(btn){
      btn.addEventListener('click', function(){ nav('reviewList', {mode: btn.getAttribute('data-cat')}); });
    });
  }

  function renderReviewList(mode){
    var entries = loadEntries(mode);
    var html = '<div class="screen">';
    html += '<div class="screen-header">'+backBtnHtml()+'<span class="screen-title">'+esc(REVIEW_LABELS[mode])+'</span></div>';
    if (!entries.length){
      html += '<div class="empty-state">ยังไม่มีบันทึกในหมวดนี้</div>';
    } else {
      html += '<div class="entry-list">';
      entries.forEach(function(e){
        html += '<button class="entry-card" data-id="'+e.id+'">'+
          '<div class="entry-date">'+fmtDate(e.ts)+' · '+fmtTime(e.ts)+'</div>'+
          '<div class="entry-preview">'+esc(previewOf(mode, e))+'</div></button>';
      });
      html += '</div>';
    }
    html += '</div>';
    app.innerHTML = html;
    document.getElementById('backBtn').addEventListener('click', back);
    app.querySelectorAll('.entry-card').forEach(function(btn){
      btn.addEventListener('click', function(){ nav('reviewDetail', {mode: mode, id: btn.getAttribute('data-id')}); });
    });
  }

  var pendingDeleteId = null;
  function renderReviewDetail(mode, id){
    var entries = loadEntries(mode);
    var entry = entries.filter(function(e){ return e.id === id; })[0];
    var html = '<div class="screen">';
    html += '<div class="screen-header">'+backBtnHtml()+'<span class="screen-title">'+(entry?fmtDate(entry.ts)+' · '+fmtTime(entry.ts):'')+'</span></div>';
    html += '<div class="detail-body">';
    if (!entry){
      html += '<div class="empty-state">ไม่พบบันทึกนี้ อาจถูกลบไปแล้ว</div>';
    } else if (mode === 'reflect'){
      REFLECT_FIELDS.forEach(function(f){
        if (!entry[f.key]) return;
        html += '<div class="detail-block"><div class="k">'+esc(f.q)+'</div><div class="v">'+esc(entry[f.key])+'</div></div>';
      });
    } else {
      html += '<div class="detail-block"><div class="v">'+esc(entry.text)+'</div></div>';
    }
    html += '</div>';
    if (entry){
      var confirming = pendingDeleteId === id;
      html += '<div class="screen-footer"><button class="btn-danger'+(confirming?' confirming':'')+'" id="deleteBtn">'+
        (confirming ? 'ยืนยันการลบ' : 'ลบบันทึกนี้') + '</button></div>';
    }
    html += '</div>';
    app.innerHTML = html;
    document.getElementById('backBtn').addEventListener('click', function(){ pendingDeleteId = null; back(); });
    var delBtn = document.getElementById('deleteBtn');
    if (delBtn){
      delBtn.addEventListener('click', function(){
        if (pendingDeleteId === id){
          deleteEntry(mode, id);
          pendingDeleteId = null;
          toast('ลบแล้ว');
          back();
        } else {
          pendingDeleteId = id;
          renderReviewDetail(mode, id);
        }
      });
    }
  }

  // --- export / import ---
  function allData(){
    return {
      reflect: loadEntries('reflect'),
      idea: loadEntries('idea'),
      thought: loadEntries('thought'),
      health: loadEntries('health'),
      exportedAt: Date.now()
    };
  }
  var importArmed = false;
  function openExportSheet(){
    importArmed = false;
    var json = JSON.stringify(allData(), null, 2);
    var wrap = document.createElement('div');
    wrap.className = 'overlay';
    wrap.id = 'exportOverlay';
    wrap.innerHTML =
      '<div class="sheet">'+
        '<div class="sheet-header"><h2>สำรองข้อมูล</h2><button class="icon-btn" id="closeSheet" aria-label="ปิด">×</button></div>'+
        '<p class="desc">ข้อมูลทั้งหมดเก็บอยู่ในเครื่องนี้เท่านั้น กดคัดลอกแล้วนำไปวางเก็บไว้ที่อื่น (เช่น Notes) เพื่อสำรองไว้กันลืม</p>'+
        '<textarea class="data" id="exportData" readonly>'+esc(json)+'</textarea>'+
        '<div class="row"><button class="btn-secondary" id="copyBtn">คัดลอก</button><button class="btn-secondary" id="downloadBtn">ดาวน์โหลดไฟล์</button></div>'+
        '<div class="divider"></div>'+
        '<h2 style="font-size:16px;margin-bottom:6px;">นำเข้าข้อมูล</h2>'+
        '<p class="desc">วางข้อมูลที่เคยคัดลอกไว้ตรงนี้ การนำเข้าจะเขียนทับข้อมูลเดิมทั้งหมด</p>'+
        '<textarea class="data" id="importData" placeholder="วางข้อมูล JSON ที่นี่"></textarea>'+
        '<div class="row"><button class="btn-secondary" id="importBtn">นำเข้าข้อมูล</button></div>'+
      '</div>';
    document.body.appendChild(wrap);

    document.getElementById('closeSheet').addEventListener('click', function(){ wrap.remove(); });
    wrap.addEventListener('click', function(ev){ if (ev.target === wrap) wrap.remove(); });

    document.getElementById('copyBtn').addEventListener('click', function(){
      var ta = document.getElementById('exportData');
      if (navigator.clipboard && navigator.clipboard.writeText){
        navigator.clipboard.writeText(json).then(function(){ toast('คัดลอกแล้ว'); }).catch(function(){ selectFallback(ta); });
      } else { selectFallback(ta); }
    });
    function selectFallback(ta){
      ta.focus(); ta.select();
      toast('เลือกข้อความไว้แล้ว กด copy ได้เลย');
    }

    document.getElementById('downloadBtn').addEventListener('click', function(){
      var blob = new Blob([json], {type:'application/json'});
      var filename = 'เงาสะท้อน-backup.json';
      try{
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url; a.download = filename;
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(function(){ URL.revokeObjectURL(url); }, 2000);
      }catch(e){ toast('ดาวน์โหลดไม่ได้ ลองใช้ปุ่มคัดลอกแทน'); }
    });

    document.getElementById('importBtn').addEventListener('click', function(){
      var btn = document.getElementById('importBtn');
      var text = document.getElementById('importData').value.trim();
      if (!text){ toast('วางข้อมูลก่อนนะ'); return; }
      if (!importArmed){
        importArmed = true;
        btn.textContent = 'ยืนยันการเขียนทับข้อมูลเดิม';
        return;
      }
      try{
        var obj = JSON.parse(text);
        ['reflect','idea','thought','health'].forEach(function(k){
          if (Array.isArray(obj[k])) saveEntries(k, obj[k]);
        });
        toast('นำเข้าข้อมูลแล้ว');
        wrap.remove();
        render();
      }catch(e){
        toast('ไฟล์ไม่ถูกต้อง ตรวจสอบอีกครั้งนะ');
        importArmed = false;
        btn.textContent = 'นำเข้าข้อมูล';
      }
    });
  }

  render();

  if ('serviceWorker' in navigator){
    window.addEventListener('load', function(){
      navigator.serviceWorker.register('service-worker.js').catch(function(){});
    });
  }
})();
