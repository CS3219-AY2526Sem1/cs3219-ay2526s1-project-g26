declare module 'pidusage' {
  interface Stat {
    cpu: number
    memory: number
    ppid: number
    pid: number
    ctime: number
    elapsed: number
    timestamp: number
  }

  function pidusage(pid: number): Promise<Stat>
  function pidusage(pids: number[]): Promise<Record<number, Stat>>

  export = pidusage
}
