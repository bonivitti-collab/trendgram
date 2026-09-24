// Push-token registration was intentionally removed. No personal push backend is used.
export default function handler(_req: unknown, res: { status: (code: number) => { json: (body: unknown) => unknown } }) {
  return res.status(410).json({ error: 'Push notifications disabled' });
}
