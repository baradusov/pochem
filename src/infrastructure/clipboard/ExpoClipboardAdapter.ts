import * as Clipboard from 'expo-clipboard';
import { ClipboardPort } from '../../core/ports/ClipboardPort';

export class ExpoClipboardAdapter implements ClipboardPort {
  async copy(text: string): Promise<void> {
    await Clipboard.setStringAsync(text);
  }
}
