// ===== Data (localStorage; fallback ke memori jika diblokir) =====
const KEY='rancabali_wisata', AUTH='rancabali_admin';
const ADMIN={user:'adminrancabali',pass:'admin123'}; // DEMO saja. Di produksi: autentikasi di server.
const seed=[
 {id:1,nama:'Kawah Putih',deskripsi:'Destinasi wisata alam yang terkenal dengan danau kawah berwarna putih kehijauan dan suasana pegunungan.',fasilitas:'Area parkir, Toilet, Musholla, Warung makan, Spot foto',tiketWni:31000,tiketWna:90000,tiketAnak:15000,jam:'07.30-16.30',alamat:'Rancabali, Kabupaten Bandung, Jawa Barat',kontak:'081324068194',foto:'',maps:'https://www.google.com/maps/place/Kawah+Putih+Rancabali'},
 {id:2,nama:'Situ Patenggang',deskripsi:'Danau yang dikelilingi kebun teh dengan pemandangan indah dan legenda Batu Cinta.',fasilitas:'Area parkir, Toilet, Musholla, Perahu',tiketWni:20000,tiketWna:40000,tiketAnak:10000,jam:'07.00-17.00',alamat:'Rancabali, Kabupaten Bandung, Jawa Barat',kontak:'',foto:'',maps:'https://www.google.com/maps/place/Situ+Patenggang'}
];
let mem=null;
const load=()=>{try{const d=JSON.parse(localStorage.getItem(KEY));if(d)return d}catch(e){}return mem||seed};
const save=d=>{mem=d;try{localStorage.setItem(KEY,JSON.stringify(d))}catch(e){}};
const isAdmin=()=>{if(window._a===1)return true;try{return sessionStorage.getItem(AUTH)==='1'}catch(e){return false}};
const setAdmin=v=>{window._a=v?1:0;try{v?sessionStorage.setItem(AUTH,'1'):sessionStorage.removeItem(AUTH)}catch(e){}};

const $=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const rp=n=>n?'Rp '+Number(n).toLocaleString('id-ID'):'-';
const img=w=>`<div class="ph" style="${w.foto?`background-image:url(${w.foto})`:''}"></div>`;

// ===== Router =====
function render(){
  const [r,id]=(location.hash.slice(2)||'').split('/');
  $('#nav').innerHTML=`<a href="#/">Beranda</a><a href="#/wisata">Wisata</a><a href="#/admin">${isAdmin()?'Dashboard':'Admin'}</a>`;
  const adm=r==='admin';
  if(adm){
    if(!isAdmin()&&id!=='login')return location.hash='#/admin/login';
    ({login:pgLogin,'':pgDash,undefined:pgDash,wisata:pgList,form:pgForm}[id]||pgDash)(id==='form'?(location.hash.split('/')[3]):null);
  } else if(r==='wisata'&&id)pgDetail(+id);
  else if(r==='wisata')pgWisata();
  else pgHome();
  scrollTo(0,0);
}
addEventListener('hashchange',render);

// ===== Pengunjung =====
function cards(){return load().map(w=>`<div class="card">${img(w)}<div class="body"><b>${esc(w.nama)}</b><p class="mut">${esc(w.alamat)}</p><a class="btn full" href="#/wisata/${w.id}">Lihat</a></div></div>`).join('')}
function pgHome(){$('#app').innerHTML=`<div class="hero"><h1>Jelajahi Keindahan Rancabali</h1><p>Temukan destinasi wisata terbaik di Rancabali dengan mudah melalui peta interaktif.</p><a class="btn" href="#/wisata" style="background:#fff;color:#1f7fb8">Lihat Destinasi →</a></div><h2>Destinasi Wisata</h2><div class="grid">${cards()}</div>`}
function pgWisata(){
  $('#app').innerHTML=`<h2>Destinasi Wisata</h2><input id="q" placeholder="Cari wisata..." style="margin-bottom:16px"><div class="grid" id="g">${cards()}</div>`;
  $('#q').oninput=e=>{const q=e.target.value.toLowerCase();document.querySelectorAll('#g .card').forEach(c=>c.style.display=c.textContent.toLowerCase().includes(q)?'':'none')};
}
function pgDetail(id){
  const w=load().find(x=>x.id===id);if(!w)return $('#app').innerHTML='<p>Wisata tidak ditemukan.</p><a href="#/wisata">← Kembali</a>';
  const mapQ=encodeURIComponent(w.nama+' '+w.alamat);
  $('#app').innerHTML=`<a href="#/wisata">← Kembali</a><h1>${esc(w.nama)}</h1>
  <div class="two"><div>${img(w).replace('height:150px','')}<p>${esc(w.deskripsi)}</p></div>
  <div><div class="box"><h3>Fasilitas</h3><ul class="fas">${w.fasilitas.split(',').filter(x=>x.trim()).map(f=>`<li>${esc(f.trim())}</li>`).join('')}</ul></div>
  <div class="box"><h3>Harga Tiket</h3>Wisatawan (WNI): ${rp(w.tiketWni)}<br>Wisatawan (WNA): ${rp(w.tiketWna)}<br>Tiket anak: ${rp(w.tiketAnak)}</div>
  <div class="box"><h3>Jam Operasional</h3>${esc(w.jam)||'-'}</div>
  <div class="box"><h3>Alamat &amp; Kontak</h3>📍 ${esc(w.alamat)}<br>📞 ${esc(w.kontak)||'-'}</div></div></div>
  <div class="box"><h3>Lokasi Wisata ${w.maps?`<a class="btn" style="float:right" target="_blank" rel="noopener" href="${esc(w.maps)}">Lihat di Google Maps</a>`:''}</h3>
  <iframe loading="lazy" src="https://maps.google.com/maps?q=${mapQ}&output=embed" title="Peta"></iframe></div>`;
}

// ===== Admin =====
function pgLogin(){
  $('#app').innerHTML=`<div class="box login"><h2 style="text-align:center">Login Admin</h2><div id="e"></div>
  <form id="loginForm"><label for="u">Username</label><input id="u" autocomplete="username" required><label for="p">Password</label><input id="p" type="password" autocomplete="current-password" required>
  <p><button class="btn full" type="submit">Login</button></p></form><p class="mut" style="font-size:.8rem">Demo: adminrancabali / admin123</p></div>`;
  $('#loginForm').onsubmit=e=>{
    e.preventDefault();
    if($('#u').value.trim()===ADMIN.user&&$('#p').value.trim()===ADMIN.pass){setAdmin(true);location.hash='#/admin'}
    else $('#e').innerHTML='<div class="err">Username atau password salah!</div>';
  };
}
function adminBar(){return `<p><a class="btn gray" href="#/admin">Dashboard</a> <a class="btn gray" href="#/admin/wisata">Kelola Wisata</a> <button class="btn red" id="lo">Logout</button></p>`}
function bindLogout(){$('#lo').onclick=()=>{setAdmin(false);location.hash='#/admin/login'}}
function pgDash(){
  const d=load();
  $('#app').innerHTML=`<h2>Dashboard</h2>${adminBar()}<div class="stats"><div class="stat"><b>${d.length}</b>Data wisata</div><div class="stat"><b>${d.filter(x=>x.foto).length}</b>Foto wisata</div><div class="stat"><b>${d.filter(x=>x.maps).length}</b>Link Maps</div></div><div class="box"><b>Selamat datang, Admin!</b><br>Kelola data wisata, foto dan lokasi wisata Rancabali.</div>`;
  bindLogout();
}
function pgList(){
  const d=load();
  $('#app').innerHTML=`<h2>Kelola Data Wisata</h2>${adminBar()}<p><a class="btn" href="#/admin/form/new">+ Tambah Wisata</a></p>
  <div class="box wrap"><table><tr><th>Nama</th><th>Foto</th><th>Maps</th><th></th></tr>${d.map(w=>`<tr><td>${esc(w.nama)}</td><td>${w.foto?'✓':'-'}</td><td>${w.maps?'✓':'-'}</td><td><a class="btn gray" href="#/admin/form/${w.id}">Edit</a> <button class="btn red" data-del="${w.id}">Hapus</button></td></tr>`).join('')}</table></div>`;
  bindLogout();
  document.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{if(confirm('Hapus data wisata ini?')){save(load().filter(x=>x.id!==+b.dataset.del));pgList()}});
}
function pgForm(id){
  const d=load(),w=d.find(x=>x.id===+id)||{nama:'',deskripsi:'',fasilitas:'',tiketWni:'',tiketWna:'',tiketAnak:'',jam:'',alamat:'',kontak:'',foto:'',maps:''};
  const f=(k,l,t='text')=>`<label>${l}</label><input id="f_${k}" type="${t}" value="${esc(w[k])}">`;
  $('#app').innerHTML=`<h2>${w.id?'Edit':'Tambah'} Wisata</h2>${adminBar()}<div class="box">
  ${f('nama','Nama Wisata')}<label>Deskripsi</label><textarea id="f_deskripsi" rows="3">${esc(w.deskripsi)}</textarea>
  ${f('fasilitas','Fasilitas (pisahkan dengan koma)')}${f('tiketWni','Harga Tiket WNI (Rp)','number')}${f('tiketWna','Harga Tiket WNA (Rp)','number')}${f('tiketAnak','Harga Tiket Anak (Rp)','number')}
  ${f('jam','Jam Operasional')}${f('alamat','Alamat')}${f('kontak','Kontak')}${f('maps','Link Google Maps','url')}
  <label>Foto Wisata</label><input id="f_file" type="file" accept="image/*"><div id="pv" style="margin-top:8px;max-width:240px">${w.foto?img(w):''}</div>
  <p><button class="btn" id="sv">Simpan</button> <a class="btn gray" href="#/admin/wisata">Batal</a></p></div>`;
  bindLogout();
  let foto=w.foto;
  $('#f_file').onchange=e=>{const file=e.target.files[0];if(!file)return;const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{const s=Math.min(1,800/im.width),c=document.createElement('canvas');c.width=im.width*s;c.height=im.height*s;c.getContext('2d').drawImage(im,0,0,c.width,c.height);foto=c.toDataURL('image/jpeg',.7);$('#pv').innerHTML=img({foto})};im.src=r.result};r.readAsDataURL(file)};
  $('#sv').onclick=()=>{
    const v=k=>$('#f_'+k).value.trim();
    if(!v('nama'))return alert('Nama wisata wajib diisi');
    const o={id:w.id||Date.now(),nama:v('nama'),deskripsi:v('deskripsi'),fasilitas:v('fasilitas'),tiketWni:+v('tiketWni')||0,tiketWna:+v('tiketWna')||0,tiketAnak:+v('tiketAnak')||0,jam:v('jam'),alamat:v('alamat'),kontak:v('kontak'),maps:v('maps'),foto};
    save(w.id?d.map(x=>x.id===w.id?o:x):[...d,o]);location.hash='#/admin/wisata';
  };
}
render();
