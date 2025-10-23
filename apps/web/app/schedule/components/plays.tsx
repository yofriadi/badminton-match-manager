"use client";

import Link from "next/link";
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@workspace/ui/components/alert-dialog";
import { PlaysProps } from "../lib/types";

export const Plays: React.FC<PlaysProps> = ({ schedule }) => {
  const { hall, price, date, sessions } = schedule;
  return (
    <Card className="w-full max-w-[calc(100vw-2rem)] overflow-hidden mx-4 px-6 space-y-4">
      <CardHeader className="pt-4">
        <CardTitle className="flex items-baseline justify-between">
          <span>{hall}</span>
          <span className="text-xl min-w-[103px]">{price}</span>
        </CardTitle>
        <CardDescription className="flex justify-between">
          <span className="text-xs text-gray-500">{date}</span>
          <span className="text-xs text-gray-500">per person</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {sessions.map((session, i) => (
          <div key={i}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1">
                <span className="text-base font-bold">{session.timeStart}</span>
                <div className="w-8 h-px bg-gray-300"></div>
                <span className="text-base font-bold">{session.timeEnd}</span>
              </div>

              <p className={"text-sm font-medium text-right max-w-[135px]"}>
                {session.playerLevel}
              </p>
            </div>

            <div className="flex items-center gap-2 mb-2">
              {(Array.isArray(session.court)
                ? session.court
                : [session.court]
              ).map((courtNumber, courtIndex) => (
                <svg
                  key={`${courtNumber}-${courtIndex}`}
                  className="w-8 h-8"
                  viewBox="0 0 32 32"
                  role="img"
                  aria-label={`Court ${courtNumber}`}
                >
                  <path
                    fill="rgb(209, 213, 219)"
                    d="M 32.0000,16.0000 31.9614,21.0092 31.8455,23.0670 31.6517,24.6205 31.3790,25.8978 31.0257,26.9853 30.5896,27.9259 30.0674,28.7438 29.4543,29.4543 28.7438,30.0674 27.9259,30.5896 26.9853,31.0257 25.8978,31.3790 24.6205,31.6517 23.0670,31.8455 21.0092,31.9614 16.0000,32.0000 10.9908,31.9614 8.9330,31.8455 7.3795,31.6517 6.1022,31.3790 5.0147,31.0257 4.0741,30.5896 3.2562,30.0674 2.5457,29.4543 1.9326,28.7438 1.4104,27.9259 0.9743,26.9853 0.6210,25.8978 0.3483,24.6205 0.1545,23.0670 0.0386,21.0092 0.0000,16.0000 0.0386,10.9908 0.1545,8.9330 0.3483,7.3795 0.6210,6.1022 0.9743,5.0147 1.4104,4.0741 1.9326,3.2562 2.5457,2.5457 3.2562,1.9326 4.0741,1.4104 5.0147,0.9743 6.1022,0.6210 7.3795,0.3483 8.9330,0.1545 10.9908,0.0386 16.0000,0.0000 21.0092,0.0386 23.0670,0.1545 24.6205,0.3483 25.8978,0.6210 26.9853,0.9743 27.9259,1.4104 28.7438,1.9326 29.4543,2.5457 30.0674,3.2562 30.5896,4.0741 31.0257,5.0147 31.3790,6.1022 31.6517,7.3795 31.8455,8.9330 31.9614,10.9908 Z"
                  />
                  <text
                    x="16"
                    y="16"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="14"
                    fontWeight="600"
                    fill="#FFFFFF"
                  >
                    {courtNumber}
                  </text>
                </svg>
              ))}
            </div>

            <div className="overflow-x-auto scrollbar-hide -mx-6 px-6">
              <div className="flex gap-2 min-w-max">
                {session.tags.map((tag, tagIndex) => (
                  <Badge
                    key={tagIndex}
                    variant="secondary"
                    className="text-xs whitespace-nowrap font-normal"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
      <CardFooter className="mb-3 flex w-full justify-center gap-8">
        <Button
          asChild
          className="hover:bg-gray-800 rounded-full w-[80%]"
        >
          <Link href={`/schedule/${schedule.id}`}>Detail</Link>
        </Button>
      </CardFooter>
      {/*<CardFooter className="mb-4 flex w-full justify-center gap-8">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" className="rounded-full w-32 uppercase">
              cancel
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Cancellation</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to cancel this schedule? This action
                cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction
                onClick={() => console.log("Booking cancelled")}
              >
                Continue to cancel
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <Button className="hover:bg-gray-800 rounded-full w-32 uppercase">
          edit
        </Button>
      </CardFooter>*/}
    </Card>
  );
};
