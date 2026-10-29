const { test } = require('node:test');
const assert = require('node:assert/strict');
const seed = require('../src/data/products');
const { createInMemoryProductRepository } = require('../src/repositories/inMemoryProductRepository');
const { createProductService } = require('../src/services/productService');
const { createProductController } = require('../src/controllers/productController');
const { AppError } = require('../src/domain/errors');

function setup() {
  const repo = createInMemoryProductRepository(seed);
  const service = createProductService(repo);
  return { repo, service, controller: createProductController(service) };
}
const validBody = () => ({ name:'Jam Tangan Digital', description:'Tahan air', category:'Electronics', price:250000, image:'https://picsum.photos/seed/jam-tangan/400/400', variants:{colorOrSize:['Black','Silver'],quantity:20} });
function assertError(fn, code, includes) {
  assert.throws(fn, (e) => e instanceof AppError && e.code === code && (!includes || e.message.includes(includes)));
}
function invoke(controller, method, {params={},query={},body={}}={}) {
  let statusCode=200, payload;
  const res={ status(code){statusCode=code;return this}, json(v){payload=v;return this;} };
  controller[method]({params,query,body},res);
  return {status:statusCode,body:payload};
}

test('seed berisi 9 produk / 4 kategori dan state antar instance terisolasi',()=>{
  const a=setup(); const b=setup();
  assert.equal(a.service.list().total,9);
  assert.equal(new Set(a.service.list().data.map(p=>p.category)).size,4);
  a.service.create(validBody());
  assert.equal(a.service.list().total,10);
  assert.equal(b.service.list().total,9);
});

test('GET list bentuk dan isi lengkap',()=>{
  const {service}=setup(); const r=service.list();
  assert.equal(r.total,9);assert.equal(r.data.length,9);
  assert.deepEqual(Object.keys(r.data[0]).sort(), ['category','description','id','image','name','price','variants'].sort());
});
test('detail 200 dan 404 via controller',()=>{
  const {controller}=setup();
  assert.equal(invoke(controller,'detail',{params:{id:'1'}}).status,200);
  assert.equal(invoke(controller,'detail',{params:{id:'99'}}).status,404);
});
test('search case insensitive mencocokkan nama dan deskripsi',()=>{
  const {service}=setup();
  assert.equal(service.list({q:'SEPATU'}).total,2);
  assert.equal(service.list({q:'cotton'}).total,1);
});
test('query spasi kosong diabaikan',()=>{
  const {service}=setup();assert.equal(service.list({q:'  ',category:'  '}).total,9);
});
test('filter kategori exact case insensitive',()=>{
  const {service}=setup();assert.equal(service.list({category:'electronics'}).total,2);
  assert.equal(service.list({category:'Fash'}).total,0);
});
test('harga min/max inklusif',()=>{
  const {service}=setup();const r=service.list({minPrice:'120000',maxPrice:'180000'});
  assert.deepEqual(r.data.map(p=>p.price).sort((a,b)=>a-b),[120000,180000]);
});
test('hanya satu batas min dan max juga inklusif',()=>{
  const {service}=setup();assert.equal(service.list({minPrice:'850000'}).total,1);
  assert.equal(service.list({maxPrice:'60000'}).total,1);
});
test('minPrice lebih besar dari maxPrice menghasilkan 400',()=>{
  const {controller}=setup();let r=invoke(controller,'list',{query:{minPrice:'500000',maxPrice:'100000'}});
  assert.equal(r.status,400);assert.match(r.body.message,/minPrice/);
});
test('batas harga bukan angka, Infinity dan NaN ditolak',()=>{
  const {service}=setup();for (const v of ['abc','Infinity','NaN']) assertError(()=>service.list({minPrice:v}),'BAD_REQUEST');
});
test('minPrice kosong diabaikan',()=>{
  const {service}=setup();assert.equal(service.list({minPrice:'',maxPrice:''}).total,9);
});
test('sort harga naik/turun',()=>{
  const {service}=setup();
  assert.equal(service.list({sort:'price_asc'}).data[0].price,60000);
  assert.equal(service.list({sort:'price_desc'}).data[0].price,850000);
});
test('sort nama A-Z / Z-A',()=>{
  const {service}=setup();
  assert.equal(service.list({sort:'name_asc'}).data[0].name,'Headphone Wireless');
  assert.equal(service.list({sort:'name_desc'}).data[0].name,'Tote Bag Canvas');
});
test('sort invalid menghasilkan 400',()=>{
  const {controller}=setup();assert.equal(invoke(controller,'list',{query:{sort:'invalid'}}).status,400);
});
test('query array atau object ditolak',()=>{
  const {controller}=setup();
  assert.equal(invoke(controller,'list',{query:{q:['sepatu','kaos']}}).status,400);
  assert.equal(invoke(controller,'list',{query:{q:{nested:'a'}}}).status,400);
});
test('kombinasi q, category, harga, sort',()=>{
  const {service}=setup();const r=service.list({q:'sepatu',category:'Footwear',minPrice:'300000',sort:'price_desc'});
  assert.deepEqual(r.data.map(p=>p.name),['Sepatu Running','Sepatu Sneakers']);
});
test('hasil kosong memiliki message',()=>{
  const {service}=setup();const r=service.list({q:'tidak-ada'});
  assert.equal(r.total,0);assert.deepEqual(r.data,[]);assert.equal(typeof r.message,'string');
});
test('POST 201 id=10, terlihat melalui GET',()=>{
  const {controller,service}=setup();const r=invoke(controller,'create',{body:validBody()});
  assert.equal(r.status,201);assert.equal(r.body.id,10);
  assert.equal(service.getById(10).name,'Jam Tangan Digital');
});
test('POST invalid 400 errors, list tak berubah',()=>{
  const {controller,service}=setup();const r=invoke(controller,'create',{body:{price:1}});
  assert.equal(r.status,400);assert.ok(r.body.errors.length>0);assert.equal(service.list().total,9);
});
test('POST menolak URL non HTTP/HTTPS dan quantity pecahan',()=>{
  const {controller}=setup();const a=validBody();a.image='ftp://example.com/file';a.variants.quantity=1.7;
  const r=invoke(controller,'create',{body:a});assert.equal(r.status,400);
  assert.ok(r.body.errors.some(e=>e.includes('image')));assert.ok(r.body.errors.some(e=>e.includes('quantity')));
});
test('POST body array atau null ditolak',()=>{
  const {controller}=setup();assert.equal(invoke(controller,'create',{body:[]}).status,400);
  assert.equal(invoke(controller,'create',{body:null}).status,400);
});
test('PUT parsial menjaga field lain dan id lama',()=>{
  const {controller,service}=setup();const r=invoke(controller,'put',{params:{id:'1'},body:{price:123456,id:1000}});
  assert.equal(r.status,200);assert.equal(r.body.id,1);assert.equal(r.body.price,123456);
  assert.equal(service.getById(1).name,'Kaos Polos Cotton');
});
test('PUT mengubah variants.quantity saja',()=>{
  const {controller,service}=setup();const before=service.getById(1);
  const r=invoke(controller,'put',{params:{id:'1'},body:{variants:{quantity:99}}});
  assert.equal(r.status,200);assert.deepEqual(r.body.variants.colorOrSize,before.variants.colorOrSize);
  assert.equal(r.body.variants.quantity,99);
});
test('PATCH mengubah field tunggal',()=>{
  const {controller,service}=setup();const r=invoke(controller,'patch',{params:{id:'1'},body:{description:'Deskripsi baru'}});
  assert.equal(r.status,200);assert.equal(r.body.description,'Deskripsi baru');
  assert.equal(service.getById(1).price,75000);
});
test('PATCH nested quantity saja, pilihan lama tetap',()=>{
  const {controller,service}=setup();const before=service.getById(1);
  const r=invoke(controller,'patch',{params:{id:'1'},body:{variants:{quantity:77}}});
  assert.equal(r.status,200);assert.equal(r.body.variants.quantity,77);
  assert.deepEqual(r.body.variants.colorOrSize,before.variants.colorOrSize);
});
test('PATCH invalid field return 400 tanpa mengubah state',()=>{
  const {controller,service}=setup();const before=service.getById(1);
  const r=invoke(controller,'patch',{params:{id:'1'},body:{price:-100}});
  assert.equal(r.status,400);assert.deepEqual(service.getById(1),before);
});
test('PUT dan PATCH produk tidak ada 404',()=>{
  const {controller}=setup();for(const method of ['put','patch']) {
    assert.equal(invoke(controller,method,{params:{id:'999'},body:{price:100}}).status,404);
  }
});
test('DELETE 200 menghapus produk dan GET kemudian 404',()=>{
  const {controller,service}=setup();const r=invoke(controller,'remove',{params:{id:'1'}});
  assert.equal(r.status,200);assert.equal(r.body.data.id,1);
  assert.equal(service.list().total,8);assertError(()=>service.getById(1),'NOT_FOUND');
});
test('DELETE tidak ada mengembalikan 404',()=>{
  const {controller}=setup();assert.equal(invoke(controller,'remove',{params:{id:'999'}}).status,404);
});
test('alur lengkap POST -> PUT -> PATCH -> DELETE mengembalikan total 9',()=>{
  const {controller,service}=setup();
  const created=invoke(controller,'create',{body:validBody()});const id=created.body.id;
  assert.equal(service.list().total,10);
  assert.equal(invoke(controller,'put',{params:{id:String(id)},body:{price:300000}}).body.price,300000);
  assert.equal(invoke(controller,'patch',{params:{id:String(id)},body:{variants:{quantity:99}}}).body.variants.quantity,99);
  assert.equal(invoke(controller,'remove',{params:{id:String(id)}}).status,200);
  assert.equal(service.list().total,9);
});
test('repository tidak membocorkan referensi mutable ke pemanggil',()=>{
  const {repo}=setup();const products=repo.list();products[0].variants.quantity=777;
  assert.equal(repo.findById(1).variants.quantity,25);
});
test('next ID mempertahankan kontrak max+1 meski ada ID dihapus',()=>{
  const {controller}=setup();
  assert.equal(invoke(controller,'remove',{params:{id:'9'}}).status,200);
  assert.equal(invoke(controller,'create',{body:validBody()}).body.id,9);
});

test('POST dan PATCH menolak price Infinity pada penggunaan programatik',()=>{
  const {controller}=setup();const body=validBody();body.price=Infinity;
  assert.equal(invoke(controller,'create',{body}).status,400);
  assert.equal(invoke(controller,'patch',{params:{id:'1'},body:{price:Infinity}}).status,400);
});
