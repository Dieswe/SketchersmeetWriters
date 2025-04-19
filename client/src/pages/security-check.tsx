import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

export default function SecurityCheck() {
  const [headers, setHeaders] = useState<Record<string, string>>({});
  const [rateLimitTest, setRateLimitTest] = useState<{ status: string; count: number }>({
    status: 'idle',
    count: 0
  });

  useEffect(() => {
    // Controleer de beveiligingsheaders
    fetch('/api/prompts')
      .then(response => {
        const headerEntries = Array.from(response.headers.entries());
        const headerObj = Object.fromEntries(headerEntries);
        setHeaders(headerObj);
      })
      .catch(error => {
        console.error('Error fetching headers:', error);
      });
  }, []);

  const testRateLimit = async () => {
    setRateLimitTest({ status: 'testing', count: 0 });
    let successCount = 0;
    let failedCount = 0;

    // Maak 15 requests om de rate limiter te testen
    const maxRequests = 15;
    for (let i = 0; i < maxRequests; i++) {
      try {
        await fetch('/api/prompts', {
          method: 'GET',
          headers: { 'X-Test-Rate-Limit': 'true' },
          credentials: 'include'
        });
        successCount++;
        setRateLimitTest({
          status: 'testing',
          count: successCount
        });
      } catch (error) {
        failedCount++;
        break;
      }
      
      // Korte pauze tussen requests
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    setRateLimitTest({
      status: 'complete',
      count: successCount
    });
  };

  const securityHeaders = [
    'content-security-policy',
    'strict-transport-security',
    'x-content-type-options',
    'x-dns-prefetch-control',
    'x-download-options',
    'x-frame-options',
    'x-permitted-cross-domain-policies',
    'x-ratelimit-limit',
    'x-ratelimit-remaining',
    'access-control-allow-origin'
  ];

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Beveiligingscontrole</h1>
      
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Beveiligingsheaders</h2>
        <div className="bg-slate-50 p-4 rounded-lg border">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left py-2">Header</th>
                <th className="text-left py-2">Waarde</th>
                <th className="text-left py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {securityHeaders.map(header => (
                <tr key={header} className="border-t">
                  <td className="py-2 pr-4 font-mono text-sm">{header}</td>
                  <td className="py-2 pr-4 font-mono text-sm truncate max-w-md">
                    {headers[header] || '-'}
                  </td>
                  <td className="py-2">
                    {headers[header] ? (
                      <span className="text-green-600 flex items-center">
                        <CheckIcon className="mr-1 h-4 w-4" /> Aanwezig
                      </span>
                    ) : (
                      <span className="text-amber-600 flex items-center">
                        <XIcon className="mr-1 h-4 w-4" /> Niet gevonden
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Rate Limiting Test</h2>
        <div className="bg-slate-50 p-4 rounded-lg border">
          <p className="mb-4">
            Deze test probeert meerdere API-verzoeken te doen om te controleren of rate limiting werkt.
          </p>
          
          <div className="flex items-center gap-4 mb-4">
            <Button 
              onClick={testRateLimit}
              disabled={rateLimitTest.status === 'testing'}
            >
              {rateLimitTest.status === 'testing' ? 'Bezig met testen...' : 'Start Rate Limit Test'}
            </Button>
            
            {rateLimitTest.status !== 'idle' && (
              <div>
                <span className="font-semibold">Status: </span>
                {rateLimitTest.status === 'testing' ? (
                  <span>Bezig met testen ({rateLimitTest.count} succesvolle verzoeken)</span>
                ) : (
                  <span>Test voltooid met {rateLimitTest.count} succesvolle verzoeken</span>
                )}
              </div>
            )}
          </div>
          
          <div className="text-sm text-slate-600">
            <p>Verwacht resultaat: Bij teveel verzoeken zou de rate limiter moeten ingrijpen.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}