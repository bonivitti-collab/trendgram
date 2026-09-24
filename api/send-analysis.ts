// Scheduled push delivery was intentionally removed. The personal PWA has no notification backend.
export default function handler(_req: unknown, res: { status: (code: number) => { json: (body: unknown) => unknown } }) {
  return res.status(410).json({ error: 'Push notifications disabled' });
}
