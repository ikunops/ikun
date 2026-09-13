// db —— 统一 localStorage 读写层:统一版本号,升版即换新库(旧数据自然作废)
const V = 'v2'

export function load(name) {
  try {
    return JSON.parse(localStorage.getItem(`ikun:${V}:${name}`))
  } catch (e) {
    return null
  }
}

export function save(name, data) {
  localStorage.setItem(`ikun:${V}:${name}`, JSON.stringify(data))
}

export function remove(name) {
  localStorage.removeItem(`ikun:${V}:${name}`)
}
