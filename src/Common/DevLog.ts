export default function dev_log(...args: any[]) {
  if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
    console.log(...args)
  }
}