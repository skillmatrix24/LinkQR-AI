
'use server';

import dns from 'dns';

/**
 * Pure DNS Verification Node.
 * Performs a CNAME lookup on the public internet without requiring DB access.
 * This ensures verification works even if the Admin SDK is not fully configured.
 */
export async function verifyDomainDNSAction(domainName: string) {
  try {
    console.log(`[DNS Node] Verifying CNAME for: ${domainName}`);
    
    const resolver = new dns.promises.Resolver();
    // Use high-performance public DNS nodes
    resolver.setServers(['8.8.8.8', '1.1.1.1']); 
    
    const records = await resolver.resolveCname(domainName);
    
    const targetValue = 'cname.linkqr.in';
    // Check if any of the returned records match our infrastructure node
    const isValid = records.some(r => r.toLowerCase().trim().replace(/\.$/, "") === targetValue);

    if (isValid) {
      return { success: true };
    } else {
      return { 
        success: false, 
        error: `Invalid Record. Found: [${records.join(', ')}]. Expected: ${targetValue}` 
      };
    }
  } catch (e: any) {
    console.warn(`[DNS Node] Lookup failed for ${domainName}:`, e.code);
    
    let message = "Verification Failed.";
    if (e.code === 'ENODATA' || e.code === 'ENOTFOUND') {
      message = "No CNAME record detected. Please ensure you have added the record in your domain provider's panel.";
    } else if (e.code === 'ETIMEOUT') {
      message = "DNS lookup timed out. Please try again in a few minutes.";
    } else {
      message = `Network Error: ${e.code || "UNKNOWN"}. Check your domain settings.`;
    }
    
    return { success: false, error: message };
  }
}
