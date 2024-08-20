const paramRegExp = /params\.(\w+)(.*)/gi
const defaultValueRegExp = /\|\s*default\s*\(\s*((["'])(?:\\\2|.)*?\2|-?\d[^,)]*)/i

export const gcodeMacroParamDefault = (param: string) => {
  const valueMatch = defaultValueRegExp.exec(param)
  let result = ((valueMatch && valueMatch[1]) || '').trim()
  if (result === "''" || result === '""') {
    result = ''
  }
  return result
}

const gcodeMacroParams = (gcode: string) => {
  return [...gcode.matchAll(paramRegExp)].map(([, name, rest]) => ({
    name,
    value: gcodeMacroParamDefault(rest)
  }))
}

export default gcodeMacroParams
