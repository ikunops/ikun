// users 表 —— 种子数据(用户名=昵称,密码明文仅演示)
// # ponytail: 密码明文存 localStorage 是演示上限,接后端时换 bcrypt 并迁移字段
export const SEED_USERS = [
  {
    id: 0, username: '宗主', password: '', phone: '', email: '',
    idNumber: 'IKUN-000000', nickname: '宗主', roleType: 'sect_master',
    avatarCode: 'A02', subLevel: '5.6', title: '宗主', level: 5,
    checkinDays: 0, contribution: 0, featured: 0, joinedAt: '2023-01-01', reserved: true,
  },
  {
    id: 1, username: '大长老', password: '123456', phone: '13800000001', email: 'elder@ikun.fun',
    idNumber: 'IKUN-000001', nickname: '大长老', roleType: 'grand_elder',
    avatarCode: 'E03', subLevel: '5.5', title: '大长老', level: 5,
    checkinDays: 66, contribution: 330, featured: 6, joinedAt: '2023-01-01', reserved: true,
  },
  {
    id: 2, username: '阿坤不打篮球', password: '123456', phone: '13900000002', email: 'akun@ikun.fun',
    idNumber: 'IKUN-000002', nickname: '阿坤不打篮球', roleType: 'user',
    avatarCode: 'A01', subLevel: null, title: '核心弟子', level: 3,
    checkinDays: 33, contribution: 190, featured: 2, joinedAt: '2025-06-01',
  },
  {
    id: 3, username: '两年半练习生', password: '123456', phone: '', email: '',
    idNumber: 'IKUN-000003', nickname: '两年半练习生', roleType: 'user',
    avatarCode: 'A02', subLevel: null, title: '内门弟子', level: 2,
    checkinDays: 22, contribution: 110, featured: 1, joinedAt: '2025-08-01',
  },
  {
    id: 4, username: '鸡你太美·美', password: '123456', phone: '', email: '',
    idNumber: 'IKUN-000004', nickname: '鸡你太美·美', roleType: 'user',
    avatarCode: 'D03', subLevel: null, title: '外门弟子', level: 1,
    checkinDays: 12, contribution: 60, featured: 0, joinedAt: '2026-01-15',
  },
  {
    id: 5, username: '背带裤政委', password: '123456', phone: '', email: '',
    idNumber: 'IKUN-000005', nickname: '背带裤政委', roleType: 'user',
    avatarCode: 'E01', subLevel: null, title: '亲传弟子', level: 4,
    checkinDays: 45, contribution: 240, featured: 3, joinedAt: '2024-03-20',
  },
]
