
// Social media sharing utilities

interface ShareData {
  title: string;
  text: string;
  url: string;
}

export const shareOnTwitter = (data: ShareData) => {
  try {
    const twitterUrl = new URL('https://twitter.com/intent/tweet');
    twitterUrl.searchParams.set('text', `${data.text} ${data.url}`);
    window.open(twitterUrl.toString(), '_blank', 'width=550,height=420');
  } catch (error) {
    console.error('Error creating Twitter share URL:', error);
  }
};

export const shareOnLinkedIn = (data: ShareData) => {
  try {
    const linkedInUrl = new URL('https://www.linkedin.com/sharing/share-offsite/');
    linkedInUrl.searchParams.set('url', data.url);
    window.open(linkedInUrl.toString(), '_blank', 'width=550,height=420');
  } catch (error) {
    console.error('Error creating LinkedIn share URL:', error);
  }
};

export const shareOnFacebook = (data: ShareData) => {
  try {
    const facebookUrl = new URL('https://www.facebook.com/sharer/sharer.php');
    facebookUrl.searchParams.set('u', data.url);
    window.open(facebookUrl.toString(), '_blank', 'width=550,height=420');
  } catch (error) {
    console.error('Error creating Facebook share URL:', error);
  }
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  }
};

// Native Web Share API (if supported)
export const nativeShare = async (data: ShareData): Promise<boolean> => {
  if (navigator.share) {
    try {
      await navigator.share(data);
      return true;
    } catch (error) {
      console.log('Native sharing failed:', error);
      return false;
    }
  }
  return false;
};

// Main share function that tries native first, then fallbacks
export const sharePhynxTimer = async () => {
  const shareData: ShareData = {
    title: 'PhynxTimer - Time Tracking Made Simple',
    text: 'Check out PhynxTimer - the best free time tracking app for productivity!',
    url: 'https://phynxtimer.com'
  };

  const nativeShareSuccessful = await nativeShare(shareData);
  if (!nativeShareSuccessful) {
    // Return data for manual sharing options
    return shareData;
  }
  return null;
};
