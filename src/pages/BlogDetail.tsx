import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import BlogSidebar from '../components/BlogSidebar';
import BlogCard from '../components/BlogCard';
import { BlogPost } from '../utils/types';
import { ArrowLeft, Heart, Share, MessageSquare, CalendarDays, Clock, Link2, TrendingUp, Search } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from '@/integrations/supabase/client';
import SEO from '@/components/SEO';
import DOMPurify from 'dompurify';

// Inline styles for balloon and box elements to ensure they load
const inlineStyles = `
  /* Speech Balloon Blocks with Avatar Support */
  .prose .balloon-container,
  .blog-content .balloon-container,
  .balloon-container {
    display: flex !important;
    align-items: flex-start !important;
    margin: 20px 0 !important;
    gap: 12px !important;
    background: transparent !important;
  }

  .prose .balloon-avatar,
  .blog-content .balloon-avatar,
  .balloon-avatar {
    flex-shrink: 0 !important;
    width: 60px !important;
    height: auto !important;
    background: transparent !important;
    border: none !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    gap: 4px !important;
  }

  .prose .balloon-avatar img,
  .blog-content .balloon-avatar img,
  .balloon-avatar img {
    width: 60px !important;
    height: 60px !important;
    object-fit: cover !important;
    border-radius: 50% !important;
  }

  .prose .balloon-avatar .avatar-placeholder,
  .blog-content .balloon-avatar .avatar-placeholder,
  .balloon-avatar .avatar-placeholder {
    width: 60px !important;
    height: 60px !important;
    background: transparent !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    font-size: 32px !important;
    border-radius: 50% !important;
  }

  .prose .balloon-content,
  .blog-content .balloon-content,
  .balloon-content {
    flex: 1 !important;
    position: relative !important;
    background: transparent !important;
  }

  .prose .balloon-speech,
  .blog-content .balloon-speech,
  .balloon-speech {
    background-color: var(--balloon-color, #ffffff) !important;
    border-radius: 18px !important;
    padding: 16px 20px !important;
    border: 1px solid rgba(0, 0, 0, 0.1) !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
    position: relative !important;
    margin: 0 !important;
  }

  .prose .balloon-left .balloon-speech::before,
  .blog-content .balloon-left .balloon-speech::before,
  .balloon-left .balloon-speech::before {
    content: '' !important;
    position: absolute !important;
    left: -10px !important;
    top: 20px !important;
    width: 0 !important;
    height: 0 !important;
    border-style: solid !important;
    border-width: 10px 10px 10px 0 !important;
    border-color: transparent var(--balloon-color, #ffffff) transparent transparent !important;
  }

  .prose .balloon-right .balloon-speech::before,
  .blog-content .balloon-right .balloon-speech::before,
  .balloon-right .balloon-speech::before {
    content: '' !important;
    position: absolute !important;
    right: -10px !important;
    top: 20px !important;
    width: 0 !important;
    height: 0 !important;
    border-style: solid !important;
    border-width: 10px 0 10px 10px !important;
    border-color: transparent transparent transparent var(--balloon-color, #ffffff) !important;
  }

  /* Clean SANGO-Style Info Boxes */
  .prose .sango-box,
  .blog-content .sango-box,
  .sango-box {
    width: 100% !important;
    max-width: 680px !important;
    margin: 1.5rem auto !important;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06) !important;
    border-radius: 8px !important;
    overflow: hidden !important;
    border: none !important;
    background: transparent !important;
  }

  .prose .sango-box .box-header,
  .blog-content .sango-box .box-header,
  .sango-box .box-header {
    background-color: var(--accent, #2196f3) !important;
    color: white !important;
    font-weight: bold !important;
    font-size: 0.95rem !important;
    padding: 1rem !important;
    margin: 0 !important;
    border-radius: 8px 8px 0 0 !important;
    line-height: 1.2 !important;
    height: 48px !important;
    display: flex !important;
    align-items: center !important;
    box-sizing: border-box !important;
  }

  .prose .sango-box .box-content,
  .blog-content .sango-box .box-content,
  .sango-box .box-content {
    border: 1px solid var(--accent, #2196f3) !important;
    border-top: none !important;
    background-color: color-mix(in srgb, var(--accent, #2196f3) 10%, white) !important;
    padding: 1rem !important;
    border-radius: 0 0 8px 8px !important;
    margin: 0 !important;
    min-height: 120px !important;
    box-sizing: border-box !important;
  }

  .prose .sango-box .box-content p,
  .blog-content .sango-box .box-content p,
  .sango-box .box-content p {
    margin: 0 !important;
    padding: 0 !important;
    line-height: 1.6 !important;
    color: #333 !important;
  }

  .prose .sango-box .box-content p + p,
  .blog-content .sango-box .box-content p + p,
  .sango-box .box-content p + p {
    margin-top: 0.5rem !important;
  }

  /* Border Box Style */
  .prose .border-box,
  .blog-content .border-box,
  .border-box {
    width: 100% !important;
    max-width: 680px !important;
    margin: 1.5rem auto !important;
    border: 2px solid var(--header-color, var(--accent, #2196f3)) !important;
    border-radius: 8px !important;
    background: white !important;
  }

  .prose .border-box .box-header,
  .blog-content .border-box .box-header,
  .border-box .box-header {
    background-color: var(--header-color, var(--accent, #2196f3)) !important;
    color: white !important;
    font-weight: bold !important;
    font-size: 0.95rem !important;
    padding: 1rem !important;
    margin: 0 !important;
    line-height: 1.2 !important;
    height: 48px !important;
    display: flex !important;
    align-items: center !important;
    box-sizing: border-box !important;
  }

  .prose .border-box .box-content,
  .blog-content .border-box .box-content,
  .border-box .box-content {
    background-color: var(--content-color, white) !important;
    padding: 1rem !important;
    margin: 0 !important;
    min-height: 120px !important;
    box-sizing: border-box !important;
  }

  .prose .border-box .box-content p,
  .blog-content .border-box .box-content p,
  .border-box .box-content p {
    margin: 0 !important;
    padding: 0 !important;
    line-height: 1.6 !important;
    color: #333 !important;
  }

  .prose .border-box .box-content p + p,
  .blog-content .border-box .box-content p + p,
  .border-box .box-content p + p {
    margin-top: 0.5rem !important;
  }

  /* Left Accent Box Style */
  .prose .left-accent-box,
  .blog-content .left-accent-box,
  .left-accent-box {
    width: 100% !important;
    max-width: 680px !important;
    margin: 1.5rem auto !important;
    border-left: 6px solid var(--header-color, var(--accent, #2196f3)) !important;
    background: white !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
  }

  .prose .left-accent-box .box-header,
  .blog-content .left-accent-box .box-header,
  .left-accent-box .box-header {
    background-color: var(--header-color, color-mix(in srgb, var(--accent, #2196f3) 15%, white)) !important;
    color: var(--accent, var(--header-color, #2196f3)) !important;
    font-weight: bold !important;
    font-size: 0.95rem !important;
    padding: 1rem !important;
    margin: 0 !important;
    line-height: 1.2 !important;
    height: 48px !important;
    display: flex !important;
    align-items: center !important;
    box-sizing: border-box !important;
    border-bottom: 1px solid color-mix(in srgb, var(--accent, var(--header-color, #2196f3)) 20%, white) !important;
  }

  .prose .left-accent-box .box-content,
  .blog-content .left-accent-box .box-content,
  .left-accent-box .box-content {
    background-color: var(--content-color, white) !important;
    padding: 1rem !important;
    margin: 0 !important;
    min-height: 120px !important;
    box-sizing: border-box !important;
  }

  .prose .left-accent-box .box-content p,
  .blog-content .left-accent-box .box-content p,
  .left-accent-box .box-content p {
    margin: 0 !important;
    padding: 0 !important;
    line-height: 1.6 !important;
    color: #333 !important;
  }

  .prose .left-accent-box .box-content p + p,
  .blog-content .left-accent-box .box-content p + p,
  .left-accent-box .box-content p + p {
    margin-top: 0.5rem !important;
  }

  /* Gradient Box Style - Full Beautiful Gradient */
  .prose .gradient-box,
  .blog-content .gradient-box,
  .gradient-box {
    width: 100% !important;
    max-width: 680px !important;
    margin: 1.5rem auto !important;
    border-radius: 12px !important;
    background: linear-gradient(135deg, var(--gradient-start, #9C27B0) 0%, var(--gradient-end, #E1BEE7) 100%) !important;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15) !important;
    overflow: hidden !important;
    border: 1px solid rgba(255, 255, 255, 0.2) !important;
  }

  .prose .gradient-box .box-header,
  .blog-content .gradient-box .box-header,
  .gradient-box .box-header {
    background: transparent !important;
    color: white !important;
    font-weight: bold !important;
    font-size: 0.95rem !important;
    padding: 1.2rem 1rem !important;
    margin: 0 !important;
    line-height: 1.2 !important;
    height: 52px !important;
    display: flex !important;
    align-items: center !important;
    box-sizing: border-box !important;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3) !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2) !important;
  }

  .prose .gradient-box .box-content,
  .blog-content .gradient-box .box-content,
  .gradient-box .box-content {
    background: transparent !important;
    padding: 1.2rem 1rem !important;
    margin: 0 !important;
    min-height: 120px !important;
    box-sizing: border-box !important;
    color: white !important;
  }

  .prose .gradient-box .box-content p,
  .blog-content .gradient-box .box-content p,
  .gradient-box .box-content p {
    margin: 0 !important;
    padding: 0 !important;
    line-height: 1.6 !important;
    color: white !important;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2) !important;
  }

  .prose .gradient-box .box-content p + p,
  .blog-content .gradient-box .box-content p + p,
  .gradient-box .box-content p + p {
    margin-top: 0.5rem !important;
  }

  /* Outline Title Band Box Style */
  .prose .outline-title-band-box,
  .blog-content .outline-title-band-box,
  .outline-title-band-box {
    width: 100% !important;
    max-width: 680px !important;
    margin: 1.5rem auto !important;
    background: white !important;
    border: 2px solid var(--header-color, var(--accent, #F4C018)) !important;
    border-radius: 8px !important;
    position: relative !important;
  }

  .prose .outline-title-band-box .box-header,
  .blog-content .outline-title-band-box .box-header,
  .outline-title-band-box .box-header {
    background-color: var(--header-color, var(--accent, #F4C018)) !important;
    color: white !important;
    font-weight: bold !important;
    font-size: 0.95rem !important;
    padding: 0 1rem !important;
    margin: 0 !important;
    line-height: 1.2 !important;
    height: 44px !important;
    display: inline-flex !important;
    align-items: center !important;
    box-sizing: border-box !important;
    border-radius: 6px 6px 0 0 !important;
    position: absolute !important;
    top: -2px !important;
    left: -2px !important;
    z-index: 1 !important;
    min-width: 120px !important;
    width: auto !important;
  }

  .prose .outline-title-band-box .box-content,
  .blog-content .outline-title-band-box .box-content,
  .outline-title-band-box .box-content {
    background-color: var(--content-color, white) !important;
    padding: 1rem !important;
    margin: 0 !important;
    min-height: 120px !important;
    box-sizing: border-box !important;
    padding-top: 60px !important;
    color: #333 !important;
  }

  .prose .outline-title-band-box .box-content p,
  .blog-content .outline-title-band-box .box-content p,
  .outline-title-band-box .box-content p {
    margin: 0 !important;
    padding: 0 !important;
    line-height: 1.6 !important;
    color: #333 !important;
  }

  .prose .outline-title-band-box .box-content p + p,
  .blog-content .outline-title-band-box .box-content p + p,
  .outline-title-band-box .box-content p + p {
    margin-top: 0.5rem !important;
  }

  /* Flag Header Box Style */
  .prose .flag-header-box,
  .blog-content .flag-header-box,
  .flag-header-box {
    width: 100% !important;
    max-width: 680px !important;
    margin: 1.5rem auto !important;
    background: white !important;
    border: 2px solid var(--header-color, var(--accent, #4DA0FF)) !important;
    border-radius: 8px !important;
    position: relative !important;
  }

  .prose .flag-header-box .box-header,
  .blog-content .flag-header-box .box-header,
  .flag-header-box .box-header {
    background-color: var(--header-color, var(--accent, #4DA0FF)) !important;
    color: white !important;
    font-weight: bold !important;
    font-size: 0.9rem !important;
    padding: 0 20px 0 16px !important;
    margin: 0 !important;
    line-height: 1.2 !important;
    height: 32px !important;
    display: flex !important;
    align-items: center !important;
    box-sizing: border-box !important;
    position: absolute !important;
    top: 12px !important;
    left: 12px !important;
    min-width: 120px !important;
    max-width: 250px !important;
  }

  .prose .flag-header-box .box-header::after,
  .blog-content .flag-header-box .box-header::after,
  .flag-header-box .box-header::after {
    content: '' !important;
    position: absolute !important;
    right: -8px !important;
    top: 0 !important;
    width: 0 !important;
    height: 0 !important;
    border-style: solid !important;
    border-width: 16px 0 16px 8px !important;
    border-color: transparent transparent transparent var(--header-color, var(--accent, #4DA0FF)) !important;
  }

  .prose .flag-header-box .box-content,
  .blog-content .flag-header-box .box-content,
  .flag-header-box .box-content {
    background-color: var(--content-color, white) !important;
    padding: 1rem !important;
    margin: 0 !important;
    min-height: 120px !important;
    box-sizing: border-box !important;
    padding-top: 60px !important;
  }

  .prose .flag-header-box .box-content p,
  .blog-content .flag-header-box .box-content p,
  .flag-header-box .box-content p {
    margin: 0 !important;
    padding: 0 !important;
    line-height: 1.6 !important;
    color: #333 !important;
  }

  .prose .flag-header-box .box-content p + p,
  .blog-content .flag-header-box .box-content p + p,
  .flag-header-box .box-content p + p {
    margin-top: 0.5rem !important;
  }

  /* Rounded Box Style */
  .prose .rounded-box,
  .blog-content .rounded-box,
  .rounded-box {
    width: 100% !important;
    max-width: 680px !important;
    margin: 1.5rem auto !important;
    border-radius: 16px !important;
    background: white !important;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1) !important;
    border: 1px solid color-mix(in srgb, var(--accent, #2196f3) 30%, white) !important;
  }

  .prose .rounded-box .box-header,
  .blog-content .rounded-box .box-header,
  .rounded-box .box-header {
    background-color: color-mix(in srgb, var(--accent, #2196f3) 20%, white) !important;
    color: var(--accent, #2196f3) !important;
    font-weight: bold !important;
    font-size: 0.95rem !important;
    padding: 1rem !important;
    margin: 0 !important;
    border-radius: 16px 16px 0 0 !important;
    line-height: 1.2 !important;
    height: 48px !important;
    display: flex !important;
    align-items: center !important;
    box-sizing: border-box !important;
  }

  .prose .rounded-box .box-content,
  .blog-content .rounded-box .box-content,
  .rounded-box .box-content {
    background-color: white !important;
    padding: 1rem !important;
    margin: 0 !important;
    min-height: 120px !important;
    box-sizing: border-box !important;
    border-radius: 0 0 16px 16px !important;
  }

  .prose .rounded-box .box-content p,
  .blog-content .rounded-box .box-content p,
  .rounded-box .box-content p {
    margin: 0 !important;
    padding: 0 !important;
    line-height: 1.6 !important;
    color: #333 !important;
  }

  .prose .rounded-box .box-content p + p,
  .blog-content .rounded-box .box-content p + p,
  .rounded-box .box-content p + p {
    margin-top: 0.5rem !important;
  }

  /* Shadow Box Style */
  .prose .shadow-box,
  .blog-content .shadow-box,
  .shadow-box {
    width: 100% !important;
    max-width: 680px !important;
    margin: 1.5rem auto !important;
    background: white !important;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12) !important;
    border-radius: 8px !important;
    border-top: 4px solid var(--header-color, var(--accent, #2196f3)) !important;
  }

  .prose .shadow-box .box-header,
  .blog-content .shadow-box .box-header,
  .shadow-box .box-header {
    background-color: var(--header-color, color-mix(in srgb, var(--accent, #2196f3) 8%, white)) !important;
    color: var(--accent, var(--header-color, #2196f3)) !important;
    font-weight: bold !important;
    font-size: 0.95rem !important;
    padding: 1rem !important;
    margin: 0 !important;
    line-height: 1.2 !important;
    height: 48px !important;
    display: flex !important;
    align-items: center !important;
    box-sizing: border-box !important;
    border-bottom: 1px solid color-mix(in srgb, var(--accent, var(--header-color, #2196f3)) 15%, white) !important;
  }

  .prose .shadow-box .box-content,
  .blog-content .shadow-box .box-content,
  .shadow-box .box-content {
    background-color: var(--content-color, white) !important;
    padding: 1rem !important;
    margin: 0 !important;
    min-height: 120px !important;
    box-sizing: border-box !important;
  }

  .prose .shadow-box .box-content p,
  .blog-content .shadow-box .box-content p,
  .shadow-box .box-content p {
    margin: 0 !important;
    padding: 0 !important;
    line-height: 1.6 !important;
    color: #333 !important;
  }

  .prose .shadow-box .box-content p + p,
  .blog-content .shadow-box .box-content p + p,
  .shadow-box .box-content p + p {
    margin-top: 0.5rem !important;
  }

  /* Enhanced Custom Headings with Color Support */
  .prose .heading-line,
  .blog-content .heading-line,
  .heading-line {
    position: relative !important;
    padding-bottom: 8px !important;
    margin-bottom: 20px !important;
  }

  .prose .heading-line::after,
  .blog-content .heading-line::after,
  .heading-line::after {
    content: '' !important;
    position: absolute !important;
    bottom: 0 !important;
    left: 0 !important;
    width: 50px !important;
    height: 3px !important;
    background-color: var(--heading-color, #007bff) !important;
    border-radius: 2px !important;
  }

  .prose .heading-dotted,
  .blog-content .heading-dotted,
  .heading-dotted {
    position: relative !important;
    padding-bottom: 8px !important;
    margin-bottom: 20px !important;
  }

  .prose .heading-dotted::after,
  .blog-content .heading-dotted::after,
  .heading-dotted::after {
    content: '' !important;
    position: absolute !important;
    bottom: 0 !important;
    left: 0 !important;
    width: 80px !important;
    height: 2px !important;
    border-bottom: 2px dotted var(--heading-color, #007bff) !important;
  }

  .prose .heading-cross,
  .blog-content .heading-cross,
  .heading-cross {
    position: relative !important;
    padding-bottom: 8px !important;
    margin-bottom: 20px !important;
  }

  .prose .heading-cross::after,
  .blog-content .heading-cross::after,
  .heading-cross::after {
    content: '' !important;
    position: absolute !important;
    bottom: 0 !important;
    left: 0 !important;
    width: 60px !important;
    height: 2px !important;
    background: repeating-linear-gradient(45deg, var(--heading-color, #007bff), var(--heading-color, #007bff) 5px, transparent 5px, transparent 10px) !important;
  }

  .prose .heading-stripe,
  .blog-content .heading-stripe,
  .heading-stripe {
    position: relative !important;
    padding: 8px 16px !important;
    margin-bottom: 20px !important;
    background: linear-gradient(135deg, var(--heading-color, #007bff) 0%, color-mix(in srgb, var(--heading-color, #007bff) 80%, black) 100%) !important;
    color: white !important;
    border-radius: 4px !important;
    transform: skew(-10deg) !important;
  }

  .prose .heading-stripe span,
  .blog-content .heading-stripe span,
  .heading-stripe span {
    display: inline-block !important;
    transform: skew(10deg) !important;
  }

  .prose .heading-ribbon,
  .blog-content .heading-ribbon,
  .heading-ribbon {
    position: relative !important;
    background: var(--heading-color, #007bff) !important;
    color: white !important;
    padding: 8px 20px 8px 16px !important;
    margin-bottom: 20px !important;
    border-radius: 0 4px 4px 0 !important;
  }

  .prose .heading-ribbon::before,
  .blog-content .heading-ribbon::before,
  .heading-ribbon::before {
    content: '' !important;
    position: absolute !important;
    right: -8px !important;
    top: 0 !important;
    width: 0 !important;
    height: 0 !important;
    border-style: solid !important;
    border-width: 0 0 100% 8px !important;
    border-color: transparent transparent color-mix(in srgb, var(--heading-color, #007bff) 80%, black) transparent !important;
  }

  .prose .heading-arrow,
  .blog-content .heading-arrow,
  .heading-arrow {
    position: relative !important;
    background: var(--heading-color, #007bff) !important;
    color: white !important;
    padding: 8px 24px 8px 16px !important;
    margin-bottom: 20px !important;
    border-radius: 4px 0 0 4px !important;
  }

  .prose .heading-arrow::after,
  .blog-content .heading-arrow::after,
  .heading-arrow::after {
    content: '' !important;
    position: absolute !important;
    right: -12px !important;
    top: 50% !important;
    transform: translateY(-50%) !important;
    width: 0 !important;
    height: 0 !important;
    border-style: solid !important;
    border-width: 20px 0 20px 12px !important;
    border-color: transparent transparent transparent var(--heading-color, #007bff) !important;
  }

  .prose .heading-shadow,
  .blog-content .heading-shadow,
  .heading-shadow {
    position: relative !important;
    padding: 8px 16px !important;
    margin-bottom: 20px !important;
    background: #f8f9fa !important;
    border-left: 4px solid var(--heading-color, #007bff) !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
  }

  .prose .heading-dot,
  .blog-content .heading-dot,
  .heading-dot {
    position: relative !important;
    padding-left: 20px !important;
  }

  .prose .heading-dot::before,
  .blog-content .heading-dot::before,
  .heading-dot::before {
    content: '' !important;
    position: absolute !important;
    left: 0 !important;
    top: 50% !important;
    transform: translateY(-50%) !important;
    width: 8px !important;
    height: 8px !important;
    background-color: var(--heading-color, #007bff) !important;
    border-radius: 50% !important;
  }

  .prose .heading-sidebar,
  .blog-content .heading-sidebar,
  .heading-sidebar {
    position: relative !important;
    padding-left: 16px !important;
    border-left: 4px solid var(--heading-color, #007bff) !important;
    margin-left: 0 !important;
  }

  /* Enhanced Custom Lists */
  .prose .list-check,
  .blog-content .list-check,
  .list-check {
    list-style: none !important;
    padding-left: 0 !important;
  }

  .prose .list-check li,
  .blog-content .list-check li,
  .list-check li {
    position: relative !important;
    padding-left: 28px !important;
    margin-bottom: 8px !important;
  }

  .prose .list-check li::before,
  .blog-content .list-check li::before,
  .list-check li::before {
    content: '✓' !important;
    position: absolute !important;
    left: 0 !important;
    top: 0 !important;
    color: #28a745 !important;
    font-weight: bold !important;
    font-size: 16px !important;
  }

  .prose .list-star,
  .blog-content .list-star,
  .list-star {
    list-style: none !important;
    padding-left: 0 !important;
  }

  .prose .list-star li,
  .blog-content .list-star li,
  .list-star li {
    position: relative !important;
    padding-left: 28px !important;
    margin-bottom: 8px !important;
  }

  .prose .list-star li::before,
  .blog-content .list-star li::before,
  .list-star li::before {
    content: '★' !important;
    position: absolute !important;
    left: 0 !important;
    top: 0 !important;
    color: #ffc107 !important;
    font-weight: bold !important;
    font-size: 16px !important;
  }

  .prose .list-heart,
  .blog-content .list-heart,
  .list-heart {
    list-style: none !important;
    padding-left: 0 !important;
  }

  .prose .list-heart li,
  .blog-content .list-heart li,
  .list-heart li {
    position: relative !important;
    padding-left: 28px !important;
    margin-bottom: 8px !important;
  }

  .prose .list-heart li::before,
  .blog-content .list-heart li::before,
  .list-heart li::before {
    content: '💖' !important;
    position: absolute !important;
    left: 0 !important;
    top: 0 !important;
    font-size: 16px !important;
  }

  .prose .list-num-circle,
  .blog-content .list-num-circle,
  .list-num-circle {
    list-style: none !important;
    counter-reset: item !important;
    padding-left: 0 !important;
  }

  .prose .list-num-circle li,
  .blog-content .list-num-circle li,
  .list-num-circle li {
    position: relative !important;
    padding-left: 40px !important;
    margin-bottom: 8px !important;
    counter-increment: item !important;
  }

  .prose .list-num-circle li::before,
  .blog-content .list-num-circle li::before,
  .list-num-circle li::before {
    content: counter(item) !important;
    position: absolute !important;
    left: 0 !important;
    top: 0 !important;
    background-color: var(--heading-color, #007bff) !important;
    color: white !important;
    border-radius: 50% !important;
    width: 24px !important;
    height: 24px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    font-size: 12px !important;
    font-weight: bold !important;
  }

  .prose .list-num-square,
  .blog-content .list-num-square,
  .list-num-square {
    list-style: none !important;
    counter-reset: item !important;
    padding-left: 0 !important;
  }

  .prose .list-num-square li,
  .blog-content .list-num-square li,
  .list-num-square li {
    position: relative !important;
    padding-left: 40px !important;
    margin-bottom: 8px !important;
    counter-increment: item !important;
  }

  .prose .list-num-square li::before,
  .blog-content .list-num-square li::before,
  .list-num-square li::before {
    content: counter(item) !important;
    position: absolute !important;
    left: 0 !important;
    top: 0 !important;
    background-color: #28a745 !important;
    color: white !important;
    border-radius: 4px !important;
    width: 24px !important;
    height: 24px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    font-size: 12px !important;
    font-weight: bold !important;
  }

  .prose .list-arrow,
  .blog-content .list-arrow,
  .list-arrow {
    list-style: none !important;
    padding-left: 0 !important;
  }

  .prose .list-arrow li,
  .blog-content .list-arrow li,
  .list-arrow li {
    position: relative !important;
    padding-left: 28px !important;
    margin-bottom: 8px !important;
  }

  .prose .list-arrow li::before,
  .blog-content .list-arrow li::before,
  .list-arrow li::before {
    content: '→' !important;
    position: absolute !important;
    left: 0 !important;
    top: 0 !important;
    color: var(--heading-color, #007bff) !important;
    font-weight: bold !important;
    font-size: 16px !important;
  }

  .prose .list-double-arrow,
  .blog-content .list-double-arrow,
  .list-double-arrow {
    list-style: none !important;
    padding-left: 0 !important;
  }

  .prose .list-double-arrow li,
  .blog-content .list-double-arrow li,
  .list-double-arrow li {
    position: relative !important;
    padding-left: 28px !important;
    margin-bottom: 8px !important;
  }

  .prose .list-double-arrow li::before,
  .blog-content .list-double-arrow li::before,
  .list-double-arrow li::before {
    content: '⇒' !important;
    position: absolute !important;
    left: 0 !important;
    top: 0 !important;
    color: #dc3545 !important;
    font-weight: bold !important;
    font-size: 16px !important;
  }

  .prose .list-none,
  .blog-content .list-none,
  .list-none {
    list-style: none !important;
    padding-left: 0 !important;
  }

  .prose .list-none li,
  .blog-content .list-none li,
  .list-none li {
    margin-bottom: 8px !important;
  }

  /* Legacy balloon styles for backward compatibility (only for non-container balloons) */
  .prose .balloon-left:not(.balloon-container),
  .prose .balloon-right:not(.balloon-container), 
  .prose .balloon-both:not(.balloon-container),
  .blog-content .balloon-left:not(.balloon-container),
  .blog-content .balloon-right:not(.balloon-container),
  .blog-content .balloon-both:not(.balloon-container),
  .balloon-left:not(.balloon-container),
  .balloon-right:not(.balloon-container),
  .balloon-both:not(.balloon-container) {
    position: relative !important;
    background-color: var(--balloon-color, #ffffff) !important;
    border-radius: 12px !important;
    padding: 16px 20px !important;
    margin: 16px 0 !important;
    border: 1px solid rgba(0, 0, 0, 0.1) !important;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
    display: block !important;
  }
  
  .prose .balloon-left:not(.balloon-container)::before,
  .blog-content .balloon-left:not(.balloon-container)::before,
  .balloon-left:not(.balloon-container)::before {
    content: '' !important;
    position: absolute !important;
    left: -10px !important;
    top: 50% !important;
    transform: translateY(-50%) !important;
    width: 0 !important;
    height: 0 !important;
    border-style: solid !important;
    border-width: 10px 10px 10px 0 !important;
    border-color: transparent var(--balloon-color, #ffffff) transparent transparent !important;
  }

  .prose .balloon-right:not(.balloon-container)::before,
  .blog-content .balloon-right:not(.balloon-container)::before,
  .balloon-right:not(.balloon-container)::before {
    content: '' !important;
    position: absolute !important;
    right: -10px !important;
    top: 50% !important;
    transform: translateY(-50%) !important;
    width: 0 !important;
    height: 0 !important;
    border-style: solid !important;
    border-width: 10px 0 10px 10px !important;
    border-color: transparent transparent transparent var(--balloon-color, #ffffff) !important;
  }

  .prose .balloon-both:not(.balloon-container)::before,
  .blog-content .balloon-both:not(.balloon-container)::before,
  .balloon-both:not(.balloon-container)::before {
    content: '' !important;
    position: absolute !important;
    left: -10px !important;
    top: 50% !important;
    transform: translateY(-50%) !important;
    width: 0 !important;
    height: 0 !important;
    border-style: solid !important;
    border-width: 10px 10px 10px 0 !important;
    border-color: transparent var(--balloon-color, #ffffff) transparent transparent !important;
  }

  .prose .balloon-both:not(.balloon-container)::after,
  .blog-content .balloon-both:not(.balloon-container)::after,
  .balloon-both:not(.balloon-container)::after {
    content: '' !important;
    position: absolute !important;
    right: -10px !important;
    top: 50% !important;
    transform: translateY(-50%) !important;
    width: 0 !important;
    height: 0 !important;
    border-style: solid !important;
    border-width: 10px 0 10px 10px !important;
    border-color: transparent transparent transparent var(--balloon-color, #ffffff) !important;
  }

  .prose .box-alert,
  .prose .box-info,
  .prose .box-tip,
  .prose .box-warning,
  .prose .box-good,
  .prose .box-bad,
  .blog-content .box-alert,
  .blog-content .box-info,
  .blog-content .box-tip,
  .blog-content .box-warning,
  .blog-content .box-good,
  .blog-content .box-bad,
  .box-alert,
  .box-info,
  .box-tip,
  .box-warning,
  .box-good,
  .box-bad {
    border-radius: 8px !important;
    padding: 16px !important;
    margin: 16px 0 !important;
    border-left: 4px solid !important;
    position: relative !important;
    display: block !important;
  }

  .prose .box-alert,
  .blog-content .box-alert,
  .box-alert {
    background-color: var(--box-color, #fff3cd) !important;
    border-left-color: #ff9800 !important;
    color: #856404 !important;
  }

  .prose .box-info,
  .blog-content .box-info,
  .box-info {
    background-color: var(--box-color, #d1ecf1) !important;
    border-left-color: #17a2b8 !important;
    color: #0c5460 !important;
  }

  .prose .box-tip,
  .blog-content .box-tip,
  .box-tip {
    background-color: var(--box-color, #d4edda) !important;
    border-left-color: #28a745 !important;
    color: #155724 !important;
  }

  .prose .box-warning,
  .blog-content .box-warning,
  .box-warning {
    background-color: var(--box-color, #f8d7da) !important;
    border-left-color: #dc3545 !important;
    color: #721c24 !important;
  }

  .prose .box-good,
  .blog-content .box-good,
  .box-good {
    background-color: var(--box-color, #d1f2eb) !important;
    border-left-color: #00d4aa !important;
    color: #0c6e54 !important;
  }

  .prose .box-bad,
  .blog-content .box-bad,
  .box-bad {
    background-color: var(--box-color, #f5c6cb) !important;
    border-left-color: #e74c3c !important;
    color: #721c24 !important;
  }

  .prose .box-alert::before,
  .blog-content .box-alert::before,
  .box-alert::before {
    content: '⚠️' !important;
    position: absolute !important;
    left: 12px !important;
    top: 12px !important;
    font-size: 16px !important;
    line-height: 1 !important;
  }

  .prose .box-info::before,
  .blog-content .box-info::before,
  .box-info::before {
    content: 'ℹ️' !important;
    position: absolute !important;
    left: 12px !important;
    top: 12px !important;
    font-size: 16px !important;
    line-height: 1 !important;
  }

  .prose .box-tip::before,
  .blog-content .box-tip::before,
  .box-tip::before {
    content: '💡' !important;
    position: absolute !important;
    left: 12px !important;
    top: 12px !important;
    font-size: 16px !important;
    line-height: 1 !important;
  }

  .prose .box-warning::before,
  .blog-content .box-warning::before,
  .box-warning::before {
    content: '⚠️' !important;
    position: absolute !important;
    left: 12px !important;
    top: 12px !important;
    font-size: 16px !important;
    line-height: 1 !important;
  }

  .prose .box-good::before,
  .blog-content .box-good::before,
  .box-good::before {
    content: '✅' !important;
    position: absolute !important;
    left: 12px !important;
    top: 12px !important;
    font-size: 16px !important;
    line-height: 1 !important;
  }

  .prose .box-bad::before,
  .blog-content .box-bad::before,
  .box-bad::before {
    content: '❌' !important;
    position: absolute !important;
    left: 12px !important;
    top: 12px !important;
    font-size: 16px !important;
    line-height: 1 !important;
  }

  .prose .box-alert p,
  .prose .box-info p,
  .prose .box-tip p,
  .prose .box-warning p,
  .prose .box-good p,
  .prose .box-bad p,
  .blog-content .box-alert p,
  .blog-content .box-info p,
  .blog-content .box-tip p,
  .blog-content .box-warning p,
  .blog-content .box-good p,
  .blog-content .box-bad p,
  .box-alert p,
  .box-info p,
  .box-tip p,
  .box-warning p,
  .box-good p,
  .box-bad p {
    margin-left: 32px !important;
    margin-bottom: 0 !important;
    padding-top: 2px !important;
  }
`;

const BlogDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isLikeProcessing, setIsLikeProcessing] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [popularPosts, setPopularPosts] = useState<BlogPost[]>([]);
  const [recentPosts, setRecentPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [allBlogPosts, setAllBlogPosts] = useState<BlogPost[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  useEffect(() => {
    const fetchPostAndRelated = async () => {
      setIsLoading(true);
      try {
        // Get current date in ISO format for filtering scheduled posts
        const now = new Date().toISOString();
        if (!slug) return;
        
        // 1. Fetch the specific post
        const { data: postData, error: postError } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('slug', slug)
          .eq('published', true)
          .single();
        
        if (postError) {
          console.error('Error fetching blog post:', postError);
          setIsLoading(false);
          return;
        }
        
        if (!postData) {
          setIsLoading(false);
          return;
        }
        
        // 2. Transform the post data
        const transformedPost: BlogPost = {
          id: postData.id,
          title: postData.title,
          slug: postData.slug,
          excerpt: postData.excerpt,
          content: postData.content,
          publishedAt: new Date(postData.published_at).toLocaleDateString('ja-JP'),
          category: postData.category,
          tags: postData.tags || [],
          coverImage: postData.cover_image || 'https://placehold.co/600x400/png',
          readTime: postData.read_time,
          views: postData.views,
          author_name: postData.author_name,
          author_avatar: postData.author_avatar
        };
        
        setPost(transformedPost);
        
        // 3. Increment view count
        try {
          await supabase.rpc('increment_blog_view', { slug_param: slug });
        } catch (error) {
          console.error('Error incrementing view count:', error);
        }
        
        // 4. Fetch related posts (same category or tags)
        const { data: relatedData, error: relatedError } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('published', true)
          .neq('slug', slug)
          .or(`category.eq.${postData.category},tags.cs.{${postData.tags?.join(',')}}`)
          .limit(3);
        
        if (!relatedError && relatedData) {
          const transformedRelated: BlogPost[] = relatedData.map(post => ({
            id: post.id,
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt,
            content: post.content,
            publishedAt: new Date(post.published_at).toLocaleDateString('ja-JP'),
            category: post.category,
            tags: post.tags || [],
            coverImage: post.cover_image || 'https://placehold.co/600x400/png',
            readTime: post.read_time,
            views: post.views,
            author_name: post.author_name,
            author_avatar: post.author_avatar
          }));
          setRelatedPosts(transformedRelated);
        }
        
        // 5. Fetch popular posts
        const { data: popularData, error: popularError } = await supabase
          .from('published_blog_posts')
          .select('*')
          .order('views', { ascending: false })
          .limit(5);
        
        if (!popularError && popularData) {
          const transformedPopular: BlogPost[] = popularData.map(post => ({
            id: post.id,
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt,
            content: post.content,
            publishedAt: new Date(post.published_at).toLocaleDateString('ja-JP'),
            category: post.category,
            tags: post.tags || [],
            coverImage: post.cover_image || 'https://placehold.co/600x400/png',
            readTime: post.read_time,
            views: post.views,
            author_name: post.author_name,
            author_avatar: post.author_avatar
          }));
          setPopularPosts(transformedPopular);
        }
        
        // 6. Fetch recent posts
        const { data: recentData, error: recentError } = await supabase
          .from('published_blog_posts')
          .select('*')
          .neq('slug', slug)
          .order('published_at', { ascending: false })
          .limit(3);
        
        if (!recentError && recentData) {
          const transformedRecent: BlogPost[] = recentData.map(post => ({
            id: post.id,
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt,
            content: post.content,
            publishedAt: new Date(post.published_at).toLocaleDateString('ja-JP'),
            category: post.category,
            tags: post.tags || [],
            coverImage: post.cover_image || 'https://placehold.co/600x400/png',
            readTime: post.read_time,
            views: post.views,
            author_name: post.author_name,
            author_avatar: post.author_avatar
          }));
          setRecentPosts(transformedRecent);
        }
        
        // 7. Get unique categories and tags
        const { data: allPosts, error: allPostsError } = await supabase
          .from('published_blog_posts')
          .select('category, tags');
        
        if (!allPostsError && allPosts) {
          const allCategories = [...new Set(allPosts.map(p => p.category))];
          const allTags = [...new Set(allPosts.flatMap(p => p.tags || []))];
          setCategories(allCategories);
          setTags(allTags);
        }
        
        // 8. Log page view
        try {
          await supabase.rpc('log_page_view_text', {
            page_path: `/blog/${slug}`,
            ip: '0.0.0.0', // We don't track user IP
            user_agent: navigator.userAgent
          });
        } catch (error) {
          console.error('Error logging page view:', error);
        }
        
      } catch (err) {
        console.error('Unexpected error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPostAndRelated();
    checkAuthAndLikes();
  }, [slug]);
  
  const checkAuthAndLikes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
      
      if (user && slug) {
        // Check if user has already liked this post
        const { data: likeData, error: likeError } = await supabase
          .from('blog_likes')
          .select('id')
          .eq('user_id', user.id)
          .eq('post_slug', slug)
          .maybeSingle();
        
        if (likeError) {
          console.error('Error checking like status:', likeError);
        } else {
          setIsLiked(!!likeData);
        }
        
        // Get total likes count for this post
        const { count, error: countError } = await supabase
          .from('blog_likes')
          .select('*', { count: 'exact', head: true })
          .eq('post_slug', slug);
        
        if (countError) {
          console.error('Error getting likes count:', countError);
        } else {
          setLikesCount(count || 0);
        }
      }
    } catch (error) {
      console.error('Error in checkAuthAndLikes:', error);
    }
  };
  
  // Create structured data for BlogPosting
  const getBlogPostSchema = () => {
    if (!post) return null;
    
    return {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": post.title,
      "description": post.excerpt,
      "image": post.coverImage,
      "author": {
        "@type": "Person",
        "name": post.author_name || "るぴぴあ"
      },
      "publisher": {
        "@type": "Organization",
        "name": "るぴぴあ",
        "logo": {
          "@type": "ImageObject",
          "url": `${window.location.origin}/logo.png`
        }
      },
      "datePublished": post.publishedAt,
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": window.location.href
      },
      "keywords": post.tags.join(","),
      "articleSection": post.category
    };
  };
  
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post?.title,
        text: post?.excerpt,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "リンクをコピーしました",
        description: "ブログ記事のリンクがクリップボードにコピーされました。",
      });
    }
  };
  

  const handleLike = async () => {
    if (!currentUser) {
      toast({
        title: "ログインが必要です",
        description: "いいねするにはログインしてください。",
        variant: "destructive"
      });
      return;
    }
    
    if (isLikeProcessing) return;
    
    try {
      setIsLikeProcessing(true);
      
      if (isLiked) {
        // Unlike: Remove from database
        // First, find the record to delete
        const { data: existingLike, error: findError } = await supabase
          .from('blog_likes')
          .select('id')
          .eq('user_id', currentUser.id)
          .eq('post_slug', slug)
          .single();
        
        if (findError || !existingLike) {
          console.error('Error finding like to delete:', findError);
          throw new Error('いいねが見つかりませんでした');
        }
        
        // Now delete the specific record
        const { error } = await supabase
          .from('blog_likes')
          .delete()
          .eq('id', existingLike.id);
        
        if (error) throw error;
        
        // Update UI immediately for better UX
        setIsLiked(false);
        setLikesCount(prev => Math.max(0, prev - 1));
        
        toast.success("この記事のいいねを削除しました。");
        
        // Re-fetch to ensure consistency
        setTimeout(() => {
          checkAuthAndLikes();
        }, 1000);
      } else {
        // Like: Add to database
        const { error } = await supabase
          .from('blog_likes')
          .insert({
            user_id: currentUser.id,
            post_slug: slug,
            created_at: new Date().toISOString()
          });
        
        if (error) throw error;
        
        // Update UI immediately for better UX
        setIsLiked(true);
        setLikesCount(prev => prev + 1);
        
        toast.success("この記事をお気に入りとして保存しました。");
        
        // Re-fetch to ensure consistency
        setTimeout(() => {
          checkAuthAndLikes();
        }, 1000);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error("エラーが発生しました。もう一度お試しください。");
    } finally {
      setIsLikeProcessing(false);
    }
  };
  
  // Filter posts based on search term
  const filteredPosts = () => {
    if (!searchTerm) return [];
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    return allBlogPosts.filter(post => 
      post.title.toLowerCase().includes(lowerSearchTerm) ||
      post.excerpt.toLowerCase().includes(lowerSearchTerm) ||
      post.content.toLowerCase().includes(lowerSearchTerm) ||
      post.tags.some(tag => tag.toLowerCase().includes(lowerSearchTerm)) ||
      post.category.toLowerCase().includes(lowerSearchTerm)
    );
  };
  
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setIsSearching(true);
    
    // If we don't have all blog posts yet, fetch them
    if (allBlogPosts.length === 0) {
      fetchAllBlogPosts();
    }
  };
  
  const fetchAllBlogPosts = async () => {
    try {
      // Get current date in ISO format for filtering scheduled posts
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('published', true)
        .or(`scheduled_for.is.null,scheduled_for.lte.${now}`)
        .order('published_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching all blog posts:', error);
        return;
      }
      
      // Transform data to match BlogPost type
      if (data) {
        const transformedPosts: BlogPost[] = data.map(post => ({
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          content: post.content,
          publishedAt: new Date(post.published_at).toLocaleDateString('ja-JP'),
          category: post.category,
          tags: post.tags || [],
          coverImage: post.cover_image || 'https://placehold.co/600x400/png',
          readTime: post.read_time,
          views: post.views,
          author_name: post.author_name,
          author_avatar: post.author_avatar
        }));
        
        setAllBlogPosts(transformedPosts);
      }
    } catch (err) {
      console.error('Unexpected error fetching all blog posts:', err);
    }
  };
  
  if (isLoading) {
    return (
      <Layout>
        <SEO 
          title="ブログ記事を読み込み中..."
          description="ブログ記事を読み込んでいます。少々お待ちください。"
        />
        <div className="flex justify-center items-center h-96">
          <div className="flex space-x-2">
            <div className="w-3 h-3 rounded-full bg-primary loading-dot"></div>
            <div className="w-3 h-3 rounded-full bg-primary loading-dot"></div>
            <div className="w-3 h-3 rounded-full bg-primary loading-dot"></div>
          </div>
        </div>
      </Layout>
    );
  }
  
  if (!post) {
    return (
      <Layout>
        <SEO 
          title="記事が見つかりません"
          description="お探しのブログ記事は存在しないか、削除された可能性があります。"
        />
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold">ブログ記事が見つかりません</h2>
          <p className="text-muted-foreground mt-2">
            お探しの記事は存在しないか、削除された可能性があります。
          </p>
          <button
            onClick={() => navigate('/blog')}
            className="inline-flex items-center mt-4 text-primary hover:underline"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            ブログ一覧に戻る
          </button>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <style dangerouslySetInnerHTML={{ __html: inlineStyles }} />
      <SEO 
        title={post.title}
        description={post.excerpt}
        image={post.coverImage}
        type="article"
        publishedAt={post.publishedAt}
        author={post.author_name}
        schemaJson={getBlogPostSchema()}
        keywords={post.tags.join(', ')}
      />
      <div className="px-4 sm:px-6 md:px-8 lg:px-12">
        <button
          onClick={() => navigate('/blog')}
          className="inline-flex items-center mb-6 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          ブログ一覧に戻る
        </button>
        
        <div className="grid gap-8 lg:grid-cols-3">
          {isSearching ? (
            <div className="lg:col-span-2">
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2 flex items-center">
                  <Search className="mr-2 h-5 w-5" />
                  "{searchTerm}" の検索結果: {filteredPosts().length}件
                </h2>
                <button 
                  onClick={() => {
                    setSearchTerm('');
                    setIsSearching(false);
                  }}
                  className="text-sm text-primary hover:underline"
                >
                  検索をクリア
                </button>
              </div>
              
              {filteredPosts().length === 0 ? (
                <div className="text-center py-12 border rounded-lg">
                  <h3 className="text-lg font-medium mb-2">検索結果が見つかりませんでした</h3>
                  <p className="text-muted-foreground mb-4">
                    別のキーワードで検索するか、以下のカテゴリやタグを参照してください。
                  </p>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setIsSearching(false);
                    }}
                    className="text-primary hover:underline"
                  >
                    記事に戻る
                  </button>
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2">
                  {filteredPosts().map(post => (
                    <BlogCard key={post.id} post={post} />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="lg:col-span-2">
              <article className="space-y-6">
                <div className="relative h-64 sm:h-80 md:h-96 overflow-hidden rounded-lg">
                  <img 
                    src={post.coverImage} 
                    alt={post.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <Badge className="bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200 px-3 py-1">
                    {post.category}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <CalendarDays className="h-4 w-4" />
                    <span>{post.publishedAt}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{post.readTime}分で読めます</span>
                  </div>
                </div>
                
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
                  {post.title}
                </h1>
                
                <div 
                  className="prose prose-lg max-w-none blog-content" 
                  dangerouslySetInnerHTML={{ 
                    __html: DOMPurify.sanitize(post.content, {
                      ALLOWED_TAGS: ['div', 'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'img', 'blockquote', 'code', 'pre', 'span', 'header'],
                      ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'target', 'rel', 'class', 'style'],
                      ALLOW_DATA_ATTR: false,
                      FORBID_TAGS: [],
                      FORBID_ATTR: [],
                      KEEP_CONTENT: true
                    })
                  }} 
                />
                
                <div className="flex flex-wrap gap-2 pt-4">
                  {post.tags.map((tag, idx) => (
                    <Link 
                      key={idx} 
                      to={`/blog/tag/${encodeURIComponent(tag)}`}
                      className="inline-flex items-center rounded-full bg-gray-100 border border-gray-200 px-2.5 py-0.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-200"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
                
                <div className="flex gap-2 pt-4 border-t">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleLike}
                    disabled={isLikeProcessing}
                    className={isLiked ? 'bg-red-50 border-red-200' : ''}
                  >
                    <Heart className={`mr-1 h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                    {isLikeProcessing ? '処理中...' : `いいね ${likesCount > 0 ? `(${likesCount})` : ''}`}
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleShare}>
                    <Share className="mr-1 h-4 w-4" />
                    シェア
                  </Button>
                </div>
              </article>
              
              {/* Popular Posts Section */}
              {popularPosts.length > 0 && (
                <div className="mt-12 border-t pt-8">
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <TrendingUp className="mr-2 h-5 w-5 text-primary" />
                    人気の記事
                  </h2>
                  <div className="grid gap-6 sm:grid-cols-2">
                    {popularPosts.map(popularPost => (
                      <Card key={popularPost.id} className="overflow-hidden">
                        <div className="h-40 overflow-hidden">
                          <img 
                            src={popularPost.coverImage} 
                            alt={popularPost.title} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <CardContent className="p-4">
                          <Badge className="mb-2">{popularPost.views || 0} 閲覧</Badge>
                          <h3 className="font-semibold line-clamp-2">
                            <Link to={`/blog/${popularPost.slug}`} className="hover:underline">{popularPost.title}</Link>
                          </h3>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Related Posts Section */}
              {relatedPosts.length > 0 && (
                <div className="mt-12 border-t pt-8">
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <Link2 className="mr-2 h-5 w-5 text-primary" />
                    関連記事
                  </h2>
                  <div className="grid gap-6 sm:grid-cols-2">
                    {relatedPosts.map(relatedPost => (
                      <BlogCard 
                        key={relatedPost.id} 
                        post={relatedPost} 
                        isRelated={true}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          <BlogSidebar 
            recentPosts={recentPosts}
            categories={categories}
            tags={tags}
            onSearch={handleSearch}
          />
        </div>
      </div>
    </Layout>
  );
};

export default BlogDetail;
