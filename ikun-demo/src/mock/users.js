// users 表 —— 预置用户(宗主占位 / 大长老 / 社区样例用户)
export const SEED_USERS = [
  { id: 0, idNumber: 'IKUN-000000', nickname: '宗主', roleType: 'sect_master', avatarCode: null, subLevel: '5.6', note: '占位,暂不展示' },
  { id: 1, idNumber: 'IKUN-000001', nickname: '大长老', roleType: 'grand_elder', avatarCode: 'E03', subLevel: '5.5' },
  { id: 2, idNumber: 'IKUN-000002', nickname: '阿坤不打篮球', avatarCode: 'A01', subLevel: null },
  { id: 3, idNumber: 'IKUN-000003', nickname: '两年半练习生', avatarCode: 'A02', subLevel: null },
  { id: 4, idNumber: 'IKUN-000004', nickname: '鸡你太美·美', avatarCode: 'D03', subLevel: null },
  { id: 5, idNumber: 'IKUN-000005', nickname: '背带裤政委', avatarCode: 'E01', subLevel: null },
]

export const ID_NUMBER_PREFIX = 'IKUN-'

// 普通用户编号从 IKUN-000002 起自增,宗主/大长老为保留号
export function nextIdNumber() {
  const maxId = Math.max(...SEED_USERS.map((u) => u.id))
  return ID_NUMBER_PREFIX + String(maxId + 1).padStart(6, '0')
}
