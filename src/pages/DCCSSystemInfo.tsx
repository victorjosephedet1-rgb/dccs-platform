import React from 'react';
import { Shield, Fingerprint, Lock, Cpu, Globe, CheckCircle, ArrowRight, Code } from 'lucide-react';
import SEOHead from '../components/SEOHead';

export default function DCCSSystemInfo() {
  return (
    <>
      <SEOHead
        title="DCCS - Digital Clearance Code System | Patent-Pending Technology"
        description="Learn about the Digital Clearance Code System (DCCS), a proprietary patent-pending technology for secure digital media verification, ownership tracking, and rights management."
        keywords="DCCS, Digital Clearance Code System, patent pending, media verification, content fingerprinting, ownership verification, Victor360 Brand"
      />

      <div className="min-h-screen bg-white">
        <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 text-white py-20 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-12 h-12" />
              <span className="px-4 py-1 bg-blue-700 rounded-full text-sm font-semibold">
                Patent Pending Technology
              </span>
            </div>
            <h1 className="text-5xl font-bold mb-6">Digital Clearance Code System</h1>
            <p className="text-xl text-blue-100 max-w-3xl leading-relaxed">
              A proprietary system developed by Victor360 Brand Limited that assigns a unique
              clearance code to digital creations, enabling secure ownership verification,
              rights clearance, licensing, and monetization across digital platforms.
            </p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto py-16 px-4">
          <section className="mb-20">
            <h2 className="text-3xl font-bold text-slate-900 mb-8">What is DCCS?</h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-slate-700 leading-relaxed mb-6">
                The Digital Clearance Code System (DCCS) is a technically sophisticated,
                patent-pending digital media verification platform that combines structured
                identifiers, advanced audio fingerprinting, and distortion-tolerant verification
                to create an unprecedented level of content protection and ownership tracking.
              </p>
              <p className="text-slate-700 leading-relaxed">
                Unlike traditional copyright systems that rely on metadata or watermarks,
                DCCS analyzes the fundamental characteristics of digital media to create
                a unique fingerprint that remains detectable even after significant
                transformations or distortions.
              </p>
            </div>
          </section>

          <section className="mb-20">
            <h2 className="text-3xl font-bold text-slate-900 mb-8">Core Components</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-slate-50 rounded-xl p-8 border border-slate-200">
                <Code className="w-10 h-10 text-blue-600 mb-4" />
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  Structured Identifier System
                </h3>
                <p className="text-slate-700 mb-4">
                  Each DCCS certificate uses a patent-ready identifier format that encodes
                  meaningful metadata:
                </p>
                <div className="bg-white p-4 rounded-lg font-mono text-sm mb-4">
                  DCCS-VXB-2026-AUD-A1B2C3D4-T1
                </div>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>DCCS: System prefix</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>VXB: Issuing authority (Victor360 Brand)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>2026: Registration year</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>AUD: Media type (audio/video/image/document)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>A1B2C3D4: Unique fingerprint reference</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>T1: Version indicator</span>
                  </li>
                </ul>
              </div>

              <div className="bg-slate-50 rounded-xl p-8 border border-slate-200">
                <Fingerprint className="w-10 h-10 text-blue-600 mb-4" />
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  Enhanced Fingerprint Generation
                </h3>
                <p className="text-slate-700 mb-4">
                  Our fingerprinting technology extracts and stores multiple layers of
                  audio characteristics:
                </p>
                <ul className="space-y-3 text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong>Spectral Peak Map:</strong> Multi-resolution frequency analysis
                      capturing dominant peaks and their relationships
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong>Frequency Pair Matrix:</strong> Pitch-invariant frequency
                      relationships for detecting transposed content
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong>Energy Distribution:</strong> Power distribution across
                      frequency bands
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong>Temporal Signature:</strong> Peak spacing vectors and rhythm
                      patterns
                    </span>
                  </li>
                </ul>
              </div>

              <div className="bg-slate-50 rounded-xl p-8 border border-slate-200">
                <Cpu className="w-10 h-10 text-blue-600 mb-4" />
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  Distortion-Tolerant Verification
                </h3>
                <p className="text-slate-700 mb-4">
                  Our verification engine can identify content even after significant
                  modifications:
                </p>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Pitch shifts up to ±5 semitones</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Speed changes from 0.8x to 1.2x</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Compression artifacts (128kbps to 320kbps)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Background noise (SNR down to 15dB)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>EQ adjustments and spatial effects</span>
                  </li>
                </ul>
              </div>

              <div className="bg-slate-50 rounded-xl p-8 border border-slate-200">
                <Globe className="w-10 h-10 text-blue-600 mb-4" />
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  Global Verification Network
                </h3>
                <p className="text-slate-700 mb-4">
                  Anyone, anywhere can verify the authenticity and ownership of DCCS-protected
                  content:
                </p>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Public verification portal</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>RESTful API for platform integration</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Real-time similarity scoring</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Detailed transformation detection</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-20">
            <h2 className="text-3xl font-bold text-slate-900 mb-8">How It Works</h2>
            <div className="space-y-8">
              <div className="flex gap-6">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                  1
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Content Registration</h3>
                  <p className="text-slate-700">
                    When you upload digital content to dccsverify.com, our system automatically
                    processes it through the DCCS pipeline. The audio is normalized, analyzed
                    for spectral and temporal characteristics, and a structured fingerprint
                    object is generated and stored.
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                  2
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Code Generation</h3>
                  <p className="text-slate-700">
                    A unique structured DCCS code is generated based on the content fingerprint,
                    registration year, media type, and issuing authority. This code becomes the
                    permanent identifier for your content across the internet.
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                  3
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Global Verification</h3>
                  <p className="text-slate-700">
                    Anyone can verify content by uploading a file or entering a DCCS code.
                    Our distortion-tolerant engine compares the submitted content against
                    our registry, detecting matches even across transformations and providing
                    detailed similarity scores and confidence levels.
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                  4
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Rights Management</h3>
                  <p className="text-slate-700">
                    DCCS certificates serve as proof of ownership and enable automated licensing,
                    royalty tracking, and dispute resolution. The system maintains an immutable
                    audit trail of all verifications and rights transactions.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-20">
            <h2 className="text-3xl font-bold text-slate-900 mb-8">
              Why DCCS is Different
            </h2>
            <div className="bg-gradient-to-br from-blue-50 to-slate-50 rounded-2xl p-8 border border-blue-200">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-3">
                    Traditional Copyright Systems
                  </h3>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li className="flex items-start gap-2">
                      <span className="text-red-500">✗</span>
                      <span>Rely on easily modified metadata</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500">✗</span>
                      <span>Watermarks can be removed or obscured</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500">✗</span>
                      <span>Manual verification processes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500">✗</span>
                      <span>No distortion tolerance</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500">✗</span>
                      <span>Limited global accessibility</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-3">
                    DCCS Technology
                  </h3>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Analyzes fundamental audio characteristics</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Fingerprints survive transformations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Automated verification in seconds</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Detects pitch, speed, and quality changes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Public API and verification portal</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-20">
            <div className="bg-gradient-to-br from-slate-900 to-blue-900 text-white rounded-2xl p-12">
              <Lock className="w-12 h-12 mb-6" />
              <h2 className="text-3xl font-bold mb-4">Patent-Pending Technology</h2>
              <p className="text-blue-100 text-lg mb-8 max-w-3xl">
                The Digital Clearance Code System represents a novel approach to digital media
                verification, combining structured identifier encoding, multi-resolution
                fingerprint analysis, and distortion-tolerant matching in a way that has not
                been implemented before. Patent applications are in progress.
              </p>
              <div className="flex flex-wrap gap-4">
                <a
                  href="/dccs-verification"
                  className="px-6 py-3 bg-white text-blue-900 font-semibold rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-2"
                >
                  Try Verification Portal
                  <ArrowRight className="w-5 h-5" />
                </a>
                <a
                  href="/phase1-upload"
                  className="px-6 py-3 bg-blue-700 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                >
                  Register Your Content
                  <ArrowRight className="w-5 h-5" />
                </a>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-slate-900 mb-6">
              About Victor360 Brand Limited
            </h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              Victor360 Brand Limited is the creator and exclusive owner of the Digital
              Clearance Code System (DCCS) technology. All rights, patents, trademarks,
              and intellectual property related to DCCS are owned by Victor360 Brand Limited.
            </p>
            <p className="text-slate-700 leading-relaxed">
              The DCCS technology is provided exclusively through the dccsverify.com platform
              and authorized partners. Unauthorized use, reproduction, or implementation of
              DCCS technology is prohibited.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
