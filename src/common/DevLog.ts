export default function dev_log(...args: any[]) {
  if (process.env.NODE_ENV === 'development') {
    console.log(...args)
  }
}