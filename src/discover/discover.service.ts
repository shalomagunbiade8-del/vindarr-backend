
import {
  Injectable,
  BadGatewayException,
  ServiceUnavailableException,
  GatewayTimeoutException,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';

interface DiscoverSearchInput {
  query: string;
  category: string;
  location: string;
}

interface TavilySearchResult {
  title?: string;
  url?: string;
  content?: string;
  published_date?: string | null;
}

interface TavilySearchResponse {
  results?: TavilySearchResult[];
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

@Injectable()
export class DiscoverService {
  private readonly rateLimits =
    new Map<string, RateLimitEntry>();

  private readonly allowedCategories = [
    'all',
    'jobs',
    'scholarships',
    'funding',
    'business',
    'stores',
    'restaurants',
    'services',
  ];

  private readonly categoryKeywords: Record<string, string> = {
    all: '',
    jobs: 'jobs vacancies careers internships',
    scholarships: 'scholarships fellowships study opportunities',
    funding: 'business grants funding loans finance',
    business: 'business services company registration professional services',
    stores: 'online stores shopping retailers',
    restaurants: 'restaurants food cafes dining',
    services: 'professional services local services',
  };

  constructor(
    private readonly configService: ConfigService,
  ) {}

  checkRateLimit(ip: string): boolean {
    const now = Date.now();
    const windowMs = 60 * 1000;
    const maxRequests = 30;

    const existing = this.rateLimits.get(ip);

    if (!existing || existing.resetAt <= now) {
      this.rateLimits.set(ip, {
        count: 1,
        resetAt: now + windowMs,
      });

      if (this.rateLimits.size > 5000) {
        for (const [key, value] of this.rateLimits) {
          if (value.resetAt <= now) {
            this.rateLimits.delete(key);
          }
        }
      }

      return true;
    }

    if (existing.count >= maxRequests) {
      return false;
    }

    existing.count += 1;
    return true;
  }

  async search(input: DiscoverSearchInput) {
    const apiKey = this.configService.get<string>(
      'TAVILY_API_KEY',
    );

    if (!apiKey) {
      throw new ServiceUnavailableException(
        'Live Discover search is not configured. Add TAVILY_API_KEY to the backend environment.',
      );
    }

    const query = input.query.trim();

    const category = this.allowedCategories.includes(
      input.category,
    )
      ? input.category
      : 'all';

    const categoryTerms =
      this.categoryKeywords[category] || '';

    const location = input.location.trim();

    const finalQuery = [
      query,
      categoryTerms,
      location,
    ]
      .filter(Boolean)
      .join(' ');

    const controller = new AbortController();

    const timeout = setTimeout(
      () => controller.abort(),
      15000,
    );

    try {
      const response = await fetch(
        'https://api.tavily.com/search',
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },

          body: JSON.stringify({
            api_key: apiKey,
            query: finalQuery,
            search_depth: 'basic',
            topic: 'general',
            max_results: 20,
            include_answer: false,
            include_raw_content: false,
          }),

          signal: controller.signal,
        },
      );

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        throw new ServiceUnavailableException(
          'Tavily rejected the API key. Check TAVILY_API_KEY in Render.',
        );
      }

      if (
        response.status === 429 ||
        response.status === 432 ||
        response.status === 433
      ) {
        throw new ServiceUnavailableException(
          'Tavily has reached a rate or credit limit. Check your Tavily dashboard.',
        );
      }

      if (!response.ok) {
        throw new BadGatewayException(
          'Tavily could not complete the search.',
        );
      }

      const data =
        await response.json() as TavilySearchResponse;

      const rawResults = data.results || [];

      const results = rawResults
        .filter((item) => {
          if (!item.url || !item.title) {
            return false;
          }

          try {
            const parsed = new URL(item.url);

            return (
              parsed.protocol === 'https:' ||
              parsed.protocol === 'http:'
            );
          } catch {
            return false;
          }
        })
        .map((item, index) => {
          const parsedUrl = new URL(item.url!);

          return {
            id: `tavily-${index}-${encodeURIComponent(item.url!)}`,

            title: item.title || 'External result',

            description:
              item.content ||
              'Open the original website for more information.',

            category,

            url: parsedUrl.toString(),

            source: parsedUrl.hostname,

            location: location || 'Online',

            // Search results are not automatically verified.
            official: false,

            tags: [
              category === 'all'
                ? 'Web result'
                : category,
            ],

            updatedAt: item.published_date || null,
          };
        });

      return {
        results,

        total: results.length,

        query,

        category,

        location: location || null,

        source: 'tavily',

        searchedAt: new Date().toISOString(),
      };
    } catch (error) {
      if (
        error instanceof ServiceUnavailableException ||
        error instanceof BadGatewayException
      ) {
        throw error;
      }

      if (
        error instanceof Error &&
        error.name === 'AbortError'
      ) {
        throw new GatewayTimeoutException(
          'Tavily took too long to respond. Please try again.',
        );
      }

      throw new BadGatewayException(
        'Unable to search the internet right now. Please try again.',
      );
    } finally {
      clearTimeout(timeout);
    }
  }
}
