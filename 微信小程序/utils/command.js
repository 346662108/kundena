//全程包邮  7天退换  假一赔十
function getserviceData() {
  var service = [{ tid: 1, title: '全场包邮', subtitle: '所有商品均无条件包邮' },
  { tid: 2, title: '7天退换', subtitle: '商家承诺7天无理由退换货' },
  { tid: 3, title: '48小时发货', subtitle: '若超时未发货，商家将补偿3元无门槛代金券' },
  { tid: 4, title: '假一赔十', subtitle: '若收到的商品是假冒品牌，可获得加倍赔偿' }]
  return service;
}
//全程包邮  7天退换  假一赔十  过滤
function getserviceFilterData(teamIsLottery) {
  var service = getserviceData();
  //console.log(service,teamIsLottery);
  var serviceNew = [];
  for (var i = 0; i < service.length; i++) {
    var serviceItem = service[i];
    if ((teamIsLottery == 1 || teamIsLottery == 2) && serviceItem.tid == 3) continue;
    serviceNew.push(serviceItem);
  }
  return serviceNew;
}

/*
 * 对外暴露接口
 */
module.exports = {
  getserviceData: getserviceData,
  getserviceFilterData: getserviceFilterData,
}