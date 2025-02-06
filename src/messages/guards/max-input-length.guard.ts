import { CallHandler, ExecutionContext, ForbiddenException, NestInterceptor } from '@nestjs/common';
import { encode } from 'gpt-tokenizer';
import { Observable } from 'rxjs';

// Constants for image tokens
const IMAGE_TOKEN_COUNTS = {
  'low': 85,
  'high': 170,
  'auto': 85,  // default to low
};

export class GptInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, handler: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { body, user } = request;

    let tokenCounts = 0;

    body.messages = body.messages.map(message => {
      if (message.role === 'assistant') {
        message.content = '';

        return message;
      }

      // Handle content array (for messages with images)
      if (Array.isArray(message.content)) {
        message.content.forEach(content => {
          if (typeof content === 'string') {
            tokenCounts += encode(content).length;
          } else if (content.type === 'image_url') {
            // Add tokens for image based on detail level
            // const detail = content.image_url.detail || 'auto';
            tokenCounts += 800;
          }
        });
      } else {
        // Handle regular text messages
        tokenCounts += encode(message.content).length;
      }

      return message;
    }).filter(message => message.content?.length > 0);

    if (body.messages.length <= 1) {
      body.messages.unshift({
        role: 'system',
        content: 'If the user asks to generate, create, or make an image/photo/picture, respond with: "To create images, please upgrade to Premium and use DALL-E 3 or Stable Diffusion models which are specifically designed for image generation."',
      });
    }

    request.tokenCounts = tokenCounts;
    console.log('tokenCounts', tokenCounts);

    return handler.handle();
  }
}

export class ClaudeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, handler: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { body } = request;
    let tokenCounts = 0;

    body.messages = body.messages.map(message => {
      message.content = message.content.substring(0, 500);

      // Handle content array (for messages with images)
      if (Array.isArray(message.content)) {
        message.content.forEach(content => {
          if (typeof content === 'string') {
            tokenCounts += encode(content).length;
          } else if (content.type === 'image_url') {
            // Claude has different image handling, adjust token count as needed
            tokenCounts += 85; // Placeholder value, adjust based on Claude's specifications
          }
        });
      } else {
        tokenCounts += encode(message.content).length;
      }

      return message;
    });

    request.tokenCounts = tokenCounts;
    console.log('tokenCounts', tokenCounts);

    return handler.handle();
  }
}
